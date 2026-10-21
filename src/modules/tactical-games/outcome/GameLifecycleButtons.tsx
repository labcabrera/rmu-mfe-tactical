import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FlagIcon from '@mui/icons-material/Flag';
import { Button } from '@mui/material';
import { applyTacticalGame, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useTacticalNotify } from '../../services/notify-service';
import FinishGameDialog from './FinishGameDialog';
import { pendingOutcomeCharacters } from './outcome-view';

/** "Finish" while the game is in progress: opens the finish dialog. */
export const FinishGameButton: FC<{ game: TacticalGame; onFinished: (game: TacticalGame) => void }> = ({
  game,
  onFinished,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  if (game.status !== 'in_progress') return null;
  return (
    <>
      <Button variant="outlined" color="warning" startIcon={<FlagIcon />} onClick={() => setOpen(true)}>
        {t('finish-tactical-game')}
      </Button>
      <FinishGameDialog
        game={game}
        open={open}
        onClose={() => setOpen(false)}
        onFinished={(finished) => {
          setOpen(false);
          onFinished(finished);
        }}
      />
    </>
  );
};

/**
 * "Apply to the strategic model" once the game is finished: sends the outcome of the characters not applied yet (a
 * retry only sends the ones that failed). Hidden when every character is applied.
 */
export const ApplyOutcomeButton: FC<{ game: TacticalGame; onApplied: (game: TacticalGame) => void }> = ({
  game,
  onApplied,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const [busy, setBusy] = useState(false);
  if (game.status !== 'finished' || !game.outcome || game.outcome.appliedAt) return null;
  const pending = pendingOutcomeCharacters(game.outcome);
  if (pending.length === 0) return null;
  const retry = pending.some((character) => character.error);

  const apply = () => {
    setBusy(true);
    applyTacticalGame(game.id, auth)
      .then((updated) => {
        const failed = pendingOutcomeCharacters(updated.outcome).filter((character) => character.error);
        if (failed.length > 0) notify.warning(t('outcome-apply-failed-n', { count: failed.length }));
        else notify.success(t('outcome-applied-to-strategic'));
        onApplied(updated);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={apply} disabled={busy}>
      {retry ? t('outcome-apply-retry') : t('outcome-apply')}
    </Button>
  );
};
