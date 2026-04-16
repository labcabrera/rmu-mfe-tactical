import React, { FC, useContext, useState } from 'react';
import { Badge, Stack } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { createAction } from '../../api/action';
import { ActorRound } from '../../api/actor-rounds.dto';
import { imageBaseUrl } from '../../services/config';
import RmuImageButton from '../../shared/buttons/RmuImageButton';
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

  const disabledRangedAttack = !actorRound.attacks.some((a) => a.type === 'ranged');

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
        setRoundActions([...(roundActions || []), action]);
      })
      .catch((err: Error) => showError(err.message));
  };

  return (
    <>
      <Stack direction="row" spacing={1} mt={2} ml={2}>
        {!disabledMovement && (
          <>
            <Badge
              badgeContent="F"
              color="success"
              sx={{
                '& .MuiBadge-badge': {
                  right: 8,
                  top: 8,
                },
              }}
            >
              <RmuImageButton
                src={`${imageBaseUrl}images/icons/movement.png`}
                tooltip={t('Free movement')}
                onClick={() => onActionDeclaration('movement', true)}
                size={50}
              />
            </Badge>
            <RmuImageButton
              src={`${imageBaseUrl}images/icons/movement.png`}
              tooltip={t('Normal movement')}
              onClick={() => onActionDeclaration('movement', false)}
              size={50}
            />
          </>
        )}
        {!disabledMeleeAttack && (
          <RmuImageButton
            src={`${imageBaseUrl}images/icons/attack.png`}
            tooltip={t('Melee attack')}
            onClick={() => onActionDeclaration('melee_attack', false)}
          />
        )}
        {!disabledRangedAttack && (
          <RmuImageButton
            src={`${imageBaseUrl}images/icons/ranged-attack.png`}
            tooltip={t('Ranged attack')}
            onClick={() => onActionDeclaration('ranged_attack', false)}
            size={50}
          />
        )}
        <RmuImageButton
          src={`${imageBaseUrl}images/icons/add.png`}
          tooltip={t('Other actions')}
          onClick={() => setDeclareActionDialogOpen(true)}
        />
      </Stack>
      {/* <ButtonGroup variant="outlined" size="small" aria-label="Actor round declaration buttons" sx={{ mt: 1.5 }}>
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
      </ButtonGroup> */}
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
