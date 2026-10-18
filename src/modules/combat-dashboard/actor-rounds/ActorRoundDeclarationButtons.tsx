import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { alpha, Box, Button } from '@mui/material';
import { useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { createAction } from '../../api/action';
import { ActorRound } from '../../api/actor-rounds.dto';
import { isPhaseTaken } from '../../services/action-service';
import DeclareActionDialog from '../action-dialogs/DeclareActionDialog';

const ActorRoundDeclarationButtons: FC<{
  actorRound: ActorRound;
  currentPhase: number;
  setDisplayPhase: Dispatch<SetStateAction<string>>;
  /** `column` fits the board cell; `row` spreads the buttons across a phone card with 44 px targets. */
  layout?: 'column' | 'row';
}> = ({ actorRound, currentPhase, setDisplayPhase, layout = 'column' }) => {
  const isRow = layout === 'row';
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const { game, roundActions, setRoundActions } = useContext(CombatContext)!;
  const [declareActionDialogOpen, setDeclareActionDialogOpen] = useState(false);
  const pendingActions = roundActions?.filter((a) => a.status !== 'completed') || [];

  if (!actorRound || !game) return null;

  // One action point per phase: an attack needs the phase free of the actor's other (non-free) actions, e.g. an
  // attack declared in phase 1 and finished in phase 3 spends phases 1 to 3.
  const noActionPoints = isPhaseTaken(actorRound.actorId, currentPhase, roundActions || []);
  const disabledRangedAttack = noActionPoints || !actorRound.attacks.some((a) => a.type === 'ranged');
  const disabledMovement = pendingActions.some((a) => a.actorId === actorRound.actorId && a.actionType === 'movement');
  const disabledMeleeAttack =
    noActionPoints ||
    pendingActions.some((a) => a.actorId === actorRound.actorId && a.actionType === 'melee_attack' && !a.freeAction);
  const actions = [
    {
      key: 'free-movement',
      label: t('free-movement'),
      shortLabel: t('free-move'),
      hidden: disabledMovement,
      onClick: () => onActionDeclaration('movement', true),
    },
    {
      key: 'movement',
      label: t('normal-movement'),
      shortLabel: t('move'),
      hidden: disabledMovement,
      onClick: () => onActionDeclaration('movement', false),
    },
    {
      key: 'melee-attack',
      label: t('melee-attack'),
      shortLabel: t('melee'),
      hidden: disabledMeleeAttack,
      onClick: () => onActionDeclaration('melee_attack', false),
    },
    {
      key: 'ranged-attack',
      label: t('ranged-attack'),
      shortLabel: t('ranged'),
      hidden: disabledRangedAttack,
      onClick: () => onActionDeclaration('ranged_attack', false),
    },
    {
      key: 'other',
      label: t('other-actions'),
      shortLabel: t('other'),
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
      .catch((err) => notify.error(err));
  };

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isRow ? 'repeat(auto-fit, minmax(88px, 1fr))' : '1fr',
          gap: isRow ? 1 : 0.5,
          width: '100%',
          minWidth: 0,
          maxWidth: isRow ? 'none' : 132,
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
              color="primary"
              size="small"
              sx={(theme) => ({
                minWidth: 0,
                minHeight: isRow ? 44 : 24,
                justifyContent: 'center',
                px: 1,
                borderRadius: 1,
                textTransform: 'none',
                fontSize: isRow ? '0.8125rem' : '0.66rem',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                bgcolor:
                  action.key === 'other'
                    ? alpha(theme.palette.background.paper, 0.12)
                    : alpha(theme.palette.primary.main, 0.72),
                borderColor: action.key === 'other' ? alpha(theme.palette.primary.main, 0.45) : 'transparent',
                color: action.key === 'other' ? 'primary.light' : 'primary.contrastText',
                '&:hover': {
                  bgcolor:
                    action.key === 'other'
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.primary.main, 0.86),
                },
              })}
            >
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
