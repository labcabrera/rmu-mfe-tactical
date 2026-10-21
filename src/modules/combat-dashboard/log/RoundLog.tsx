import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Button,
  ButtonBase,
  Collapse,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { ActionStateMarker, combatActionInfo, combatColors, EffectList } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { Action } from '../../api/action.dto';
import { useOpenRounds } from '../../services/ap-service';
import { useFactionColor } from '../../services/faction-colors';
import { actionLabel, actionResult, actionState, actionStateTooltip } from '../actor-rounds/action-view';
import { useCombatPanel } from '../panel/CombatPanelProvider';

type TypeFilter = 'all' | 'attacks' | 'movement' | 'maneuvers';

const TYPE_FILTERS: TypeFilter[] = ['all', 'attacks', 'movement', 'maneuvers'];

const matchesType = (action: Action, filter: TypeFilter) => {
  if (filter === 'all') return true;
  const category = combatActionInfo(action.actionType).category;
  if (filter === 'attacks') return category === 'melee' || category === 'ranged';
  if (filter === 'movement') return category === 'movement';
  return category === 'maneuver';
};

/** Effects an attack left on its targets: those of its criticals, or of its fumble. */
const attackEffects = (action: Action) =>
  (action.attacks ?? []).flatMap((attack) =>
    attack.results?.fumble
      ? (attack.results.fumble.effects ?? [])
      : (attack.results?.criticals ?? []).flatMap((c) => c.result?.effects ?? [])
  );

/** One line of the log: phase span, actor, action and its result. Clicking it opens the action. */
const LogEntry: FC<{ action: Action }> = ({ action }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const { openAction } = useCombatPanel();
  const factionColor = useFactionColor();
  const openRounds = useOpenRounds();
  const actorRound = actorRounds?.find((ar) => ar.actorId === action.actorId);
  const info = combatActionInfo(action.actionType);
  const effects = action.status === 'completed' ? attackEffects(action) : [];
  const phases =
    action.phaseEnd && action.phaseEnd !== action.phaseStart
      ? `${action.phaseStart}–${action.phaseEnd}`
      : `${action.phaseStart}`;
  return (
    <ButtonBase
      onClick={() => openAction(action)}
      sx={{
        display: 'grid',
        gridTemplateColumns: '28px 20px minmax(0, 1fr) auto',
        alignItems: 'center',
        columnGap: 1,
        width: '100%',
        textAlign: 'left',
        px: 1,
        py: 0.75,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {phases}
      </Typography>
      <Box sx={(theme) => ({ display: 'flex', color: combatColors(theme)[info.category], '& svg': { fontSize: 18 } })}>
        {info.icon()}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              flexShrink: 0,
              bgcolor: factionColor(actorRound?.factionId),
            }}
          />
          <Typography variant="body2" noWrap>
            <Box component="span" sx={{ fontWeight: 700 }}>
              {actorRound?.actorName}
            </Box>
            {` · ${actionLabel(action, t, actorRounds)}`}
          </Typography>
        </Stack>
        {effects.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            <EffectList effects={effects} />
          </Box>
        )}
      </Box>
      <ActionStateMarker
        state={actionState(action)}
        text={actionResult(action, t)}
        tooltip={actionStateTooltip(action, t, openRounds)}
      />
    </ButtonBase>
  );
};

/**
 * What happened in the displayed round, grouped by phase and built from the round's actions: declared,
 * resolved, results, and the effects left by attacks. Filters by actor and by kind of action.
 */
const RoundLog: FC = () => {
  const { t } = useTranslation();
  const { actorRounds, roundActions, displayRound } = useContext(CombatContext)!;
  const [actorId, setActorId] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const actions = (roundActions ?? []).filter((a) => (!actorId || a.actorId === actorId) && matchesType(a, type));
  const order = (actorRounds ?? []).map((ar) => ar.actorId);
  const byPhase = [1, 2, 3, 4]
    .map((phase) => ({
      phase,
      actions: actions
        .filter((a) => a.phaseStart === phase)
        .sort((a, b) => order.indexOf(a.actorId) - order.indexOf(b.actorId)),
    }))
    .filter((group) => group.actions.length > 0);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          select
          size="small"
          label={t('actor')}
          value={actorId}
          onChange={(e) => setActorId(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">{t('all')}</MenuItem>
          {(actorRounds ?? []).map((ar) => (
            <MenuItem key={ar.actorId} value={ar.actorId}>
              {ar.actorName}
            </MenuItem>
          ))}
        </TextField>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={type}
          onChange={(_, value: TypeFilter | null) => value && setType(value)}
          aria-label={t('type')}
        >
          {TYPE_FILTERS.map((value) => (
            <ToggleButton key={value} value={value}>
              {t(value)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
      {byPhase.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {t('log-empty', { round: displayRound })}
        </Typography>
      )}
      {byPhase.map((group) => (
        <Box key={group.phase}>
          <Typography variant="overline" color="text.secondary">
            {t('phase-n', { phase: group.phase })}
          </Typography>
          <Stack>
            {group.actions.map((action) => (
              <LogEntry key={action.id} action={action} />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

const STRIP_KEY = 'rmu.combat.log-strip';
const STRIP_ENTRIES = 5;

/** Under the board (wide screens): the last resolved actions of the round, collapsible, with a link to the log. */
export const RoundLogStrip: FC<{ onOpenLog: () => void }> = ({ onOpenLog }) => {
  const { t } = useTranslation();
  const { roundActions } = useContext(CombatContext)!;
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STRIP_KEY) !== 'closed';
    } catch {
      return true;
    }
  });
  const toggle = () => {
    setOpen(!open);
    try {
      localStorage.setItem(STRIP_KEY, open ? 'closed' : 'open');
    } catch {
      // Storage unavailable: the state lasts until the page is left.
    }
  };
  const latest = (roundActions ?? [])
    .filter((a) => a.status === 'completed')
    .sort((a, b) => (b.phaseEnd ?? b.phaseStart) - (a.phaseEnd ?? a.phaseStart))
    .slice(0, STRIP_ENTRIES);

  return (
    <Paper sx={{ px: 1.5, py: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconButton
          size="small"
          aria-label={t('log')}
          aria-expanded={open}
          onClick={toggle}
          sx={(theme) => ({
            transform: open ? 'none' : 'rotate(-90deg)',
            transition: theme.transitions.create('transform'),
          })}
        >
          <ExpandMoreIcon />
        </IconButton>
        <Typography variant="overline" color="text.secondary" sx={{ flex: 1 }}>
          {t('latest-results')}
        </Typography>
        <Button size="small" onClick={onOpenLog}>
          {t('see-all')}
        </Button>
      </Stack>
      <Collapse in={open}>
        {latest.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, pb: 1 }}>
            {t('no-results-yet')}
          </Typography>
        ) : (
          latest.map((action) => <LogEntry key={action.id} action={action} />)
        )}
      </Collapse>
    </Paper>
  );
};

export default RoundLog;
