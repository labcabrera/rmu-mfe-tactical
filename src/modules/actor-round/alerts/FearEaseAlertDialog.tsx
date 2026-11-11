import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { RmuDialog, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolveAlert } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { easeSideFear } from '../../api/tactical-game-sides';
import { useCombatActions, useCombatGame, useCombatRound } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';
import { useSides } from '../../hooks/useSides';
import { canManageTactical } from '../../shared/permissions';

/** Alert of workspace spec 100: the side won the round and its fear may ease. */
export const FEAR_EASE_ALERT = 'fear-ease-suggested';

/**
 * End of the fear with the house rules (workspace spec 100, decision 22): the side caused more losses than it took
 * this round, so the game master may lift the balk and retreat of its standing members. Nothing is lifted by itself.
 */
const FearEaseAlertDialog: FC<{
  actorRound: ActorRound;
  sideId: string | null;
  actorIds: string[];
  alertId: string;
  open: boolean;
  onClose: () => void;
}> = ({ actorRound, sideId, actorIds, alertId, open, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { game } = useCombatGame();
  const { actorRounds } = useCombatRound();
  const { updateActorRound, refreshActorRounds } = useCombatActions();
  const { sides, sideLabel } = useSides();
  const { busy, run } = useBusyAction();
  const side = sides.find((each) => each.id === sideId);
  const names = actorIds.map((id) => (actorRounds ?? []).find((each) => each.actorId === id)?.actorName ?? id);
  const canEase = !!game && !!sideId && canManageTactical(game);

  const ease = () => {
    if (!game || !sideId) return;
    run(
      easeSideFear(game.id, sideId, auth).then((result) => {
        refreshActorRounds();
        notify.success(t('fear-eased-n', { count: result.actorIds.length }));
        onClose();
      })
    );
  };

  const dismiss = () => {
    run(
      resolveAlert(actorRound.id, alertId, auth).then((updated) => {
        updateActorRound(updated);
        onClose();
      })
    );
  };

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="sm"
      title={t('alert-fear-ease-suggested')}
      subtitle={side ? sideLabel(side) : undefined}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button key="dismiss" color="inherit" disabled={busy} onClick={dismiss}>
          {t('dismiss')}
        </Button>,
        <Button key="ease" variant="contained" disabled={busy || !canEase} onClick={ease}>
          {t('fear-ease')}
        </Button>,
      ]}
    >
      <Stack spacing={2}>
        <Alert severity="success" variant="outlined">
          {t('fear-ease-suggested-text', { side: side ? sideLabel(side) : (sideId ?? '') })}
        </Alert>
        {names.length > 0 && (
          <Box>
            <Typography variant="subtitle2">{t('fear-ease-actors')}</Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {names.map((name, index) => (
                <Typography component="li" variant="body2" key={actorIds[index]}>
                  {name}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
        <Typography variant="caption" color="text.secondary">
          {t('fear-ease-help')}
        </Typography>
      </Stack>
    </RmuDialog>
  );
};

export default FearEaseAlertDialog;
