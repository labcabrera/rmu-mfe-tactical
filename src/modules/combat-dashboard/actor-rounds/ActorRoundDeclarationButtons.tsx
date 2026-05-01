import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Badge, Stack } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { createAction } from '../../api/action';
import { ActorRound } from '../../api/actor-rounds.dto';
import { imageBaseUrl } from '../../services/config';
import RmuImageButton from '../../shared/buttons/RmuImageButton';
import DeclareActionDialog from '../action-dialogs/DeclareActionDialog';

const buttonSize = 35;

const ActorRoundDeclarationButtons: FC<{
  actorRound: ActorRound;
  currentPhase: number;
  setDisplayPhase: Dispatch<SetStateAction<string>>;
}> = ({ actorRound, currentPhase, setDisplayPhase }) => {
  const auth = useAuth();
  const { t } = useTranslation();
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
    createAction(data, auth)
      .then((action) => {
        setRoundActions([...(roundActions || []), action]);
        setDisplayPhase(game.phase);
      })
      .catch((err) => showError(err.message));
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0 }}>
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
                size={buttonSize}
              />
            </Badge>
            <RmuImageButton
              src={`${imageBaseUrl}images/icons/movement.png`}
              tooltip={t('Normal movement')}
              onClick={() => onActionDeclaration('movement', false)}
              size={buttonSize}
            />
          </>
        )}
        {!disabledMeleeAttack && (
          <RmuImageButton
            src={`${imageBaseUrl}images/icons/attack.png`}
            tooltip={t('Melee attack')}
            onClick={() => onActionDeclaration('melee_attack', false)}
            size={buttonSize}
          />
        )}
        {!disabledRangedAttack && (
          <RmuImageButton
            src={`${imageBaseUrl}images/icons/ranged-attack.png`}
            tooltip={t('Ranged attack')}
            onClick={() => onActionDeclaration('ranged_attack', false)}
            size={buttonSize}
          />
        )}
        <RmuImageButton
          src={`${imageBaseUrl}images/icons/add.png`}
          tooltip={t('Other actions')}
          onClick={() => setDeclareActionDialogOpen(true)}
          size={buttonSize}
        />
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
