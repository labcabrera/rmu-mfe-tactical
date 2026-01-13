import React, { FC, useContext, useState } from 'react';
import { Stack } from '@mui/material';
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

  if (!actorRound || !game) return <>Loading...</>;

  const disabledRangedWeapon = !actorRound.attacks.some((a) => a.type === 'ranged');

  const onMovementDeclaration = () => {
    createAction({
      gameId: game.id,
      actorId: actorRound.actorId,
      actionType: 'movement',
      phaseStart: currentPhase,
      freeAction: false,
    })
      .then((action) => {
        setRoundActions([...roundActions, action]);
      })
      .catch((err: Error) => showError(err.message));
  };

  const onMeleeAttackDeclaration = () => {
    createAction({
      gameId: game.id,
      actorId: actorRound.actorId,
      actionType: 'melee_attack',
      phaseStart: currentPhase,
      freeAction: false,
    })
      .then((action) => {
        setRoundActions([...roundActions, action]);
      })
      .catch((err: Error) => showError(err.message));
  };

  return (
    <>
      <Stack direction="row" alignItems="center" mt={3} mb={{ minHeight: 70 }}>
        <ActionIconButton
          imageSrc="/static/images/icons/movement.png"
          tooltipTitle="Movement"
          onClick={() => onMovementDeclaration()}
        />
        <ActionIconButton
          imageSrc="/static/images/icons/attack.png"
          tooltipTitle="Melee attack"
          onClick={() => onMeleeAttackDeclaration()}
        />
        <ActionIconButton
          imageSrc="/static/images/icons/ranged-attack.png"
          tooltipTitle="Ranged attack"
          disabled={disabledRangedWeapon}
          onClick={() => setDeclareActionDialogOpen(true)}
        />
        <ActionIconButton onClick={() => setDeclareActionDialogOpen(true)} imageSrc="/static/images/icons/add.png" />
      </Stack>
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
