import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import LockIcon from '@mui/icons-material/Lock';
import { Box, Button, Grid, MenuItem, Paper, Stack, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import {
  environmentFactionName,
  ENVIRONMENT_FACTION_ID,
  Faction,
  factionColor,
  LoadingState,
  TacticalGame,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { putTacticalGameSides } from '../../api/tactical-game-sides';
import { GameSide, TacticalGameWithSides } from '../../api/tactical-game-sides.dto';
import { gameSides, moveFaction, sideLabel } from '../../services/side-service';
import { canManageTactical } from '../../shared/permissions';

const SIDE_CELL = { xs: 12, md: 6, xl: 4 };
const NEW_SIDE = '__new__';
const NO_LEADER = '';
const SIDE_NAME_MAX = 60;

type Props = {
  game: TacticalGame;
  /** Strategic factions of the campaign: the names of the factions of the game. */
  factions: Faction[];
  /** Disabled while another change of the game is saved. */
  busy: boolean;
  onChange: (game: TacticalGame) => void;
};

/**
 * Sides of a tactical game (workspace spec 100): factions that fight together. The game master groups the factions
 * while the game is `created`; once it starts they are read only. A side without name is named after its factions, and
 * its leader is the default leader of the group checks and the one whose fall is a fear trigger.
 */
export default function TacticalGameSides({ game, factions, busy, onChange }: Props) {
  const { t } = useTranslation();
  const auth = useAuth();
  const theme = useTheme();
  const notify = useApiNotify();
  const sides = useMemo(() => gameSides(game), [game]);
  const [draft, setDraft] = useState<GameSide[]>(sides);
  const [saving, setSaving] = useState(false);
  const editable = game.status === 'created' && canManageTactical(game);
  const dirty = JSON.stringify(draft) !== JSON.stringify(sides);

  useEffect(() => setDraft(sides), [sides]);

  if (game.factions.length < 2) return null;

  const factionName = (id: string) =>
    id === ENVIRONMENT_FACTION_ID
      ? environmentFactionName(game.environmentFaction?.name, t)
      : (factions.find((faction) => faction.id === id)?.name ?? id);
  const colorOf = (side: GameSide) => factionColor(theme, game.factions.indexOf(side.factionIds[0] ?? ''));
  const actorFaction = (actorId: string) => game.actors.find((actor) => actor.id === actorId)?.faction.id;
  const leaderOptions = (side: GameSide) => game.actors.filter((actor) => side.factionIds.includes(actor.faction.id));
  const leaderName = (side: GameSide) => game.actors.find((actor) => actor.id === side.leaderActorId)?.name;

  const change = (sideId: string, patch: Partial<GameSide>) =>
    setDraft((prev) => prev.map((side) => (side.id === sideId ? { ...side, ...patch } : side)));
  const move = (factionId: string, target: string) =>
    setDraft((prev) => moveFaction(prev, factionId, target === NEW_SIDE ? null : target, actorFaction));

  const save = (next: GameSide[]) => {
    setSaving(true);
    const body = next.map((side) => ({ ...side, name: side.name?.trim() || null }));
    putTacticalGameSides(game.id, body, (game as TacticalGameWithSides).version, auth)
      .then((updated) => onChange(updated))
      .catch(notify.error)
      .finally(() => setSaving(false));
  };

  const disabled = busy || saving;

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t('sides')}
        </Typography>
        {saving && <LoadingState variant="inline" />}
        {!editable && (
          <Tooltip title={t('sides-locked-help')}>
            <LockIcon fontSize="small" color="disabled" aria-label={t('sides-locked-help')} />
          </Tooltip>
        )}
        {editable && (
          <>
            <Button size="small" disabled={disabled || !dirty} onClick={() => setDraft(sides)}>
              {t('discard')}
            </Button>
            <Button
              size="small"
              disabled={disabled || !(game as TacticalGameWithSides).sidesDefined}
              onClick={() => save([])}
            >
              {t('sides-reset')}
            </Button>
            <Button size="small" variant="contained" disabled={disabled || !dirty} onClick={() => save(draft)}>
              {t('save')}
            </Button>
          </>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1.5 }}>
        {t(editable ? 'sides-help' : 'sides-locked-help')}
      </Typography>
      <Grid container spacing={1.5}>
        {(editable ? draft : sides).map((side) => (
          <Grid key={side.id} size={SIDE_CELL}>
            <Paper
              variant="outlined"
              sx={{ p: 1.5, height: '100%', borderLeft: 4, borderLeftColor: colorOf(side) }}
              aria-label={sideLabel(side, factionName)}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {sideLabel(side, factionName)}
                </Typography>
                {editable ? (
                  <>
                    <TextField
                      size="small"
                      label={t('side-name')}
                      placeholder={side.factionIds.map(factionName).join(' + ')}
                      value={side.name ?? ''}
                      onChange={(event) => change(side.id, { name: event.target.value.slice(0, SIDE_NAME_MAX) })}
                      disabled={disabled}
                    />
                    <TextField
                      select
                      size="small"
                      label={t('side-leader')}
                      value={side.leaderActorId ?? NO_LEADER}
                      onChange={(event) => change(side.id, { leaderActorId: event.target.value || null })}
                      disabled={disabled}
                    >
                      <MenuItem value={NO_LEADER}>{t('side-no-leader')}</MenuItem>
                      {leaderOptions(side).map((actor) => (
                        <MenuItem key={actor.id} value={actor.id}>
                          {actor.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    {side.factionIds.map((factionId) => (
                      <TextField
                        key={factionId}
                        select
                        size="small"
                        label={factionName(factionId)}
                        value={side.id}
                        onChange={(event) => move(factionId, event.target.value)}
                        disabled={disabled}
                      >
                        {draft.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {sideLabel(option, factionName)}
                          </MenuItem>
                        ))}
                        {side.factionIds.length > 1 && <MenuItem value={NEW_SIDE}>{t('side-new')}</MenuItem>}
                      </TextField>
                    ))}
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {side.factionIds.map(factionName).join(', ')}
                    </Typography>
                    {leaderName(side) && (
                      <Typography variant="body2">{t('side-strength-leader', { name: leaderName(side) })}</Typography>
                    )}
                  </>
                )}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
