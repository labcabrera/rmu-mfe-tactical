import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import LockIcon from '@mui/icons-material/Lock';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Radio,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
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

const SIDE_CELL = { xs: 12, sm: 6, md: 4, xl: 3 };
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
 * Sides of a tactical game (workspace spec 100): factions that fight together. While the game is `created` the game
 * master picks the side of each faction in a table (one row per faction, one column per side, plus a new side), and
 * names each side and picks its leader in a card below; every change is saved at once. Once the game starts the sides
 * are read only. A side without name is named after its factions, and its leader is the default leader of the group
 * checks and the one whose fall is a fear trigger.
 */
export default function TacticalGameSides({ game, factions, busy, onChange }: Props) {
  const { t } = useTranslation();
  const auth = useAuth();
  const theme = useTheme();
  const notify = useApiNotify();
  const sides = useMemo(() => gameSides(game), [game]);
  // Shown at once while the change is saved; back to the game's sides when it fails.
  const [draft, setDraft] = useState<GameSide[]>(sides);
  const [saving, setSaving] = useState(false);
  const editable = game.status === 'created' && canManageTactical(game);

  useEffect(() => setDraft(sides), [sides]);

  if (game.factions.length < 2) return null;

  const factionName = (id: string) =>
    id === ENVIRONMENT_FACTION_ID
      ? environmentFactionName(game.environmentFaction?.name, t)
      : (factions.find((faction) => faction.id === id)?.name ?? id);
  const colorOf = (side: GameSide) => factionColor(theme, game.factions.indexOf(side.factionIds[0] ?? ''));
  const actorFaction = (actorId: string) => game.actors.find((actor) => actor.id === actorId)?.faction.id;
  const membersOf = (side: GameSide) => game.actors.filter((actor) => side.factionIds.includes(actor.faction.id));
  const leaderName = (side: GameSide) => game.actors.find((actor) => actor.id === side.leaderActorId)?.name;
  const shown = editable ? draft : sides;
  const disabled = !editable || busy || saving;

  const save = (next: GameSide[]) => {
    setDraft(next);
    setSaving(true);
    const body = next.map((side) => ({ ...side, name: side.name?.trim() || null }));
    putTacticalGameSides(game.id, body, (game as TacticalGameWithSides).version, auth)
      .then((updated) => onChange(updated))
      .catch((error) => {
        setDraft(sides);
        notify.error(error);
      })
      .finally(() => setSaving(false));
  };
  const change = (sideId: string, patch: Partial<GameSide>) =>
    save(draft.map((side) => (side.id === sideId ? { ...side, ...patch } : side)));
  const move = (factionId: string, sideId: string | null) => save(moveFaction(draft, factionId, sideId, actorFaction));
  const reset = () => {
    setSaving(true);
    putTacticalGameSides(game.id, [], (game as TacticalGameWithSides).version, auth)
      .then((updated) => onChange(updated))
      .catch(notify.error)
      .finally(() => setSaving(false));
  };

  const sideOf = (factionId: string) => shown.find((side) => side.factionIds.includes(factionId));

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
        {editable && (game as TacticalGameWithSides).sidesDefined && (
          <Button size="small" disabled={disabled} onClick={reset}>
            {t('sides-reset')}
          </Button>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1.5 }}>
        {t(editable ? 'sides-help' : 'sides-locked-help')}
      </Typography>

      {editable && (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 1.5 }}>
          <Table size="small" aria-label={t('sides')}>
            <TableHead>
              <TableRow>
                <TableCell>{t('faction')}</TableCell>
                {shown.map((side) => (
                  <TableCell
                    key={side.id}
                    align="center"
                    sx={{ borderTop: 3, borderTopColor: colorOf(side), textTransform: 'none', fontWeight: 600 }}
                  >
                    {sideLabel(side, factionName)}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ color: 'text.secondary' }}>
                  {t('side-new')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {game.factions.map((factionId) => {
                const current = sideOf(factionId);
                const alone = (current?.factionIds.length ?? 1) < 2;
                const name = factionName(factionId);
                return (
                  <TableRow key={factionId} hover>
                    <TableCell component="th" scope="row">
                      {name}
                    </TableCell>
                    {shown.map((side) => (
                      <TableCell key={side.id} align="center" padding="checkbox">
                        <Radio
                          size="small"
                          checked={current?.id === side.id}
                          disabled={disabled}
                          onChange={() => move(factionId, side.id)}
                          slotProps={{ input: { 'aria-label': `${name}: ${sideLabel(side, factionName)}` } }}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="center" padding="checkbox">
                      {/* Alone in its side, it already is a side of its own. */}
                      <Radio
                        size="small"
                        checked={false}
                        disabled={disabled || alone}
                        onChange={() => move(factionId, null)}
                        slotProps={{ input: { 'aria-label': `${name}: ${t('side-new')}` } }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Grid container spacing={1.5}>
        {shown.map((side) => (
          <Grid key={side.id} size={SIDE_CELL}>
            <Paper
              variant="outlined"
              sx={{ p: 1.5, height: '100%', borderLeft: 4, borderLeftColor: colorOf(side) }}
              aria-label={sideLabel(side, factionName)}
            >
              {editable ? (
                <Stack spacing={1.5}>
                  <SideNameField
                    side={side}
                    placeholder={side.factionIds.map(factionName).join(' + ')}
                    disabled={disabled}
                    onCommit={(name) => change(side.id, { name })}
                  />
                  <TextField
                    select
                    size="small"
                    label={t('side-leader')}
                    value={side.leaderActorId ?? NO_LEADER}
                    onChange={(event) => change(side.id, { leaderActorId: event.target.value || null })}
                    disabled={disabled}
                    slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                  >
                    <MenuItem value={NO_LEADER}>{t('side-no-leader')}</MenuItem>
                    {membersOf(side).map((actor) => (
                      <MenuItem key={actor.id} value={actor.id}>
                        {actor.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="caption" color="text.secondary">
                    {t('sides-card-summary', { factions: side.factionIds.length, actors: membersOf(side).length })}
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {sideLabel(side, factionName)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {side.factionIds.map(factionName).join(', ')}
                  </Typography>
                  {leaderName(side) && (
                    <Typography variant="body2">{t('side-strength-leader', { name: leaderName(side) })}</Typography>
                  )}
                </Stack>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/** The name of a side, saved when the field loses the focus or on Enter, and only when it changed. */
function SideNameField({
  side,
  placeholder,
  disabled,
  onCommit,
}: {
  side: GameSide;
  placeholder: string;
  disabled: boolean;
  onCommit: (name: string | null) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(side.name ?? '');

  useEffect(() => setValue(side.name ?? ''), [side.name]);

  const commit = () => {
    const name = value.trim() || null;
    if (name !== (side.name?.trim() || null)) onCommit(name);
  };

  return (
    <TextField
      size="small"
      label={t('side-name')}
      placeholder={placeholder}
      value={value}
      onChange={(event) => setValue(event.target.value.slice(0, SIDE_NAME_MAX))}
      onBlur={commit}
      onKeyDown={(event) => event.key === 'Enter' && commit()}
      disabled={disabled}
      slotProps={{ inputLabel: { shrink: true } }}
    />
  );
}
