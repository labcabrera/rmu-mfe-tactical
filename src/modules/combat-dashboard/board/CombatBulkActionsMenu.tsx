import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { IconButton, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { createAction } from '../../api/action';
import { useCombatGame, useCombatRound, useCombatActions } from '../../combat/combat-context';
import { freeMovementCandidates } from '../../services/ap-service';
import { canManageTactical } from '../../shared/permissions';

/** Actions of the game master on several actors at once, next to the shortcuts button. */
const CombatBulkActionsMenu: FC = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { game } = useCombatGame();
  const { actorRounds, roundActions, displayRound } = useCombatRound();
  const { setRoundActions, refreshActorRounds } = useCombatActions();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);

  if (!game || !canManageTactical(game)) return null;
  const phase = game.phase.startsWith('phase_') ? Number(game.phase.slice('phase_'.length)) : null;
  const declarable = phase !== null && game.status !== 'finished' && displayRound === game.round;
  const candidates =
    declarable && phase !== null ? freeMovementCandidates(actorRounds ?? [], roundActions ?? [], phase) : [];

  const declareFreeMovement = async () => {
    setAnchor(null);
    setBusy(true);
    const results = await Promise.allSettled(
      candidates.map((actorRound) =>
        createAction(
          { gameId: game.id, actorId: actorRound.actorId, actionType: 'movement', phaseStart: phase, freeAction: true },
          auth
        )
      )
    );
    const created = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
    const failed = candidates.filter((_, index) => results[index].status === 'rejected');
    setRoundActions((previous) => [...(previous ?? []), ...created]);
    refreshActorRounds();
    if (created.length > 0) notify.success(t('free-movement-bulk-done', { count: created.length }));
    if (failed.length > 0) {
      notify.warning(t('free-movement-bulk-failed', { names: failed.map((each) => each.actorName).join(', ') }));
    }
    setBusy(false);
  };

  return (
    <>
      <Tooltip title={t('bulk-actions-menu')}>
        <IconButton
          aria-label={t('bulk-actions-menu')}
          aria-haspopup="menu"
          onClick={(event) => setAnchor(event.currentTarget)}
          disabled={busy}
        >
          <PlaylistAddIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={declareFreeMovement} disabled={candidates.length === 0}>
          <ListItemText
            primary={t('free-movement-bulk')}
            secondary={
              declarable
                ? t('free-movement-bulk-help', { count: candidates.length, phase })
                : t('free-movement-bulk-unavailable')
            }
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default CombatBulkActionsMenu;
