import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { alpha, Box, Button } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { createAction } from '../../api/action';
import { ActorRound } from '../../api/actor-rounds.dto';
import { imageBaseUrl } from '../../services/config';
import DeclareActionDialog from '../action-dialogs/DeclareActionDialog';

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
  const actions = [
    {
      key: 'free-movement',
      label: t('Free movement'),
      shortLabel: t('Free'),
      icon: `${imageBaseUrl}images/icons/movement.png`,
      hidden: disabledMovement,
      onClick: () => onActionDeclaration('movement', true),
    },
    {
      key: 'movement',
      label: t('Normal movement'),
      shortLabel: t('Move'),
      icon: `${imageBaseUrl}images/icons/movement.png`,
      hidden: disabledMovement,
      onClick: () => onActionDeclaration('movement', false),
    },
    {
      key: 'melee-attack',
      label: t('Melee attack'),
      shortLabel: t('Melee'),
      icon: `${imageBaseUrl}images/icons/attack.png`,
      hidden: disabledMeleeAttack,
      onClick: () => onActionDeclaration('melee_attack', false),
    },
    {
      key: 'ranged-attack',
      label: t('Ranged attack'),
      shortLabel: t('Ranged'),
      icon: `${imageBaseUrl}images/icons/ranged-attack.png`,
      hidden: disabledRangedAttack,
      onClick: () => onActionDeclaration('ranged_attack', false),
    },
    {
      key: 'other',
      label: t('Other actions'),
      shortLabel: t('Other'),
      icon: `${imageBaseUrl}images/icons/add.png`,
      hidden: false,
      onClick: () => setDeclareActionDialogOpen(true),
    },
  ];

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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 0.5,
          width: '100%',
          minWidth: 0,
          maxWidth: 116,
          py: 0.5,
        }}
      >
        {actions
          .filter((action) => !action.hidden)
          .map((action) => (
            <Button
              key={action.key}
              title={action.label}
              onClick={action.onClick}
              variant={action.key === 'other' ? 'outlined' : 'contained'}
              color={action.key === 'free-movement' ? 'success' : 'primary'}
              size="small"
              sx={(theme) => ({
                minWidth: 0,
                minHeight: 24,
                justifyContent: 'center',
                gap: 0.5,
                px: 0.5,
                borderRadius: 1,
                textTransform: 'none',
                fontSize: '0.62rem',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                bgcolor:
                  action.key === 'other'
                    ? alpha(theme.palette.background.paper, 0.12)
                    : action.key === 'free-movement'
                      ? alpha(theme.palette.success.main, 0.68)
                      : alpha(theme.palette.primary.main, 0.72),
                borderColor: action.key === 'other' ? alpha(theme.palette.primary.main, 0.45) : 'transparent',
                color: action.key === 'other' ? 'primary.light' : 'primary.contrastText',
                '&:hover': {
                  bgcolor:
                    action.key === 'other'
                      ? alpha(theme.palette.primary.main, 0.12)
                      : action.key === 'free-movement'
                        ? alpha(theme.palette.success.main, 0.82)
                        : alpha(theme.palette.primary.main, 0.86),
                },
              })}
            >
              <Box
                component="img"
                src={action.icon}
                alt=""
                sx={{
                  width: 14,
                  height: 14,
                  objectFit: 'contain',
                  filter: 'grayscale(0.25)',
                  flex: 'none',
                }}
              />
              <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {action.shortLabel}
              </Box>
            </Button>
          ))}
      </Box>
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
