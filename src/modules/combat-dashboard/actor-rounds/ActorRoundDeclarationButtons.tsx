import React, { FC, useContext, useState } from 'react';
import { ButtonGroup } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { createAction } from '../../api/action';
import { ActorRound } from '../../api/actor-rounds.dto';
import ActionIconButton from '../../shared/buttons/ActionIconButton';
import DeclareActionDialog from '../action-dialogs/DeclareActionDialog';

const ActorRoundDeclarationButtons: FC<{ actorRound: ActorRound; currentPhase: number }> = ({
  actorRound,
  currentPhase,
}) => {
  const { showError } = useError();
  const { game, roundActions, setRoundActions } = useContext(CombatContext)!;
  const [declareActionDialogOpen, setDeclareActionDialogOpen] = useState(false);
  const pendingActions = roundActions?.filter((a) => a.status !== 'completed') || [];

  if (!actorRound || !game) return <>Loading...</>;

  const disabledRangedWeapon = !actorRound.attacks.some((a) => a.type === 'ranged');

  const disabledMovement = pendingActions.some(
    (a) => a.actorId === actorRound.actorId && a.actionType === 'movement' && !a.freeAction
  );

  const disabledMeleeAttack = pendingActions.some(
    (a) => a.actorId === actorRound.actorId && a.actionType === 'melee_attack' && !a.freeAction
  );

  const onActionDeclaration = (actionType: string, freeAction: boolean) => {
    const data = {
      gameId: game.id,
      actorId: actorRound.actorId,
      actionType: actionType,
      phaseStart: currentPhase,
      freeAction: freeAction,
    };
    createAction(data)
      .then((action) => {
        setRoundActions([...roundActions, action]);
      })
      .catch((err: Error) => showError(err.message));
  };

  return (
    <>
      <ButtonGroup variant="outlined" size="small" aria-label="Actor round declaration buttons" sx={{ mt: 1.5 }}>
        <ActionIconButton
          actionType="movement"
          onClick={() => onActionDeclaration('movement', false)}
          disabled={disabledMovement}
        />
        <ActionIconButton
          actionType="free_movement"
          onClick={() => onActionDeclaration('movement', true)}
          disabled={disabledMovement}
        />
        <ActionIconButton
          actionType="melee_attack"
          onClick={() => onActionDeclaration('melee_attack', false)}
          disabled={disabledMeleeAttack}
        />
        <ActionIconButton
          actionType="ranged_attack"
          onClick={() => onActionDeclaration('ranged_attack', false)}
          disabled={disabledRangedWeapon}
        />
        <ActionIconButton actionType="other" onClick={() => setDeclareActionDialogOpen(true)} />
      </ButtonGroup>
      <DeclareActionDialog
        actorRound={actorRound}
        phaseNumber={currentPhase}
        open={declareActionDialogOpen}
        setOpen={setDeclareActionDialogOpen}
      />
    </>
  );
};

export default ActorRoundDeclarationButtons;
