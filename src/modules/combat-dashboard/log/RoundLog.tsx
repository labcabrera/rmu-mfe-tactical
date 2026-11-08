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
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type Theme,
} from '@mui/material';
import {
  ActionStateMarker,
  combatColors,
  EffectList,
  EmptyState,
  Panel,
  SectionLabel,
  useTableText,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { Action } from '../../api/action.dto';
import { useOpenRounds } from '../../services/ap-service';
import { useFactionColor } from '../../services/faction-colors';
import { actionTypeInfo } from '../actor-rounds/action-type-info';
import { actionLabel, actionResult, actionState, actionStateTooltip } from '../actor-rounds/action-view';
import { useCombatPanel } from '../panel/CombatPanelProvider';
import AlertLogDialog from './AlertLogDialog';
import { alertIcon, alertName, alertSummary, LoggedAlert, phaseLabel, resolvedAlerts } from './alert-log';

type TypeFilter = 'all' | 'attacks' | 'movement' | 'maneuvers' | 'alerts';

const TYPE_FILTERS: TypeFilter[] = ['all', 'attacks', 'movement', 'maneuvers', 'alerts'];

/** A line of the log: an action or a resolved alert (workspace spec 087). */
type LogItem = { kind: 'action'; action: Action } | { kind: 'alert'; entry: LoggedAlert };

/** Groups of the log: the declaration of initiative, the action phases, the upkeep and the alerts of no known phase. */
const LOG_PHASES: (number | null)[] = [0, 1, 2, 3, 4, 5, null];

const matchesType = (action: Action, filter: TypeFilter) => {
  if (filter === 'all') return true;
  if (filter === 'alerts') return false;
  const category = actionTypeInfo(action.actionType).category;
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

const LOG_ROW_SX = {
  display: 'grid',
  gridTemplateColumns: '28px 20px minmax(0, 1fr) auto',
  alignItems: 'center',
  columnGap: 1,
  width: '100%',
  textAlign: 'left',
  px: 1,
  py: 0.75,
  borderRadius: (theme: Theme) => `${theme.radius.sm}px`,
  '&:hover': { bgcolor: 'action.hover' },
};

/** One line of a resolved alert (workspace spec 087): its phase, actor, name and result. Clicking it shows the detail. */
const AlertEntry: FC<{ entry: LoggedAlert }> = ({ entry }) => {
  const { t } = useTranslation();
  const tableText = useTableText();
  const factionColor = useFactionColor();
  const [open, setOpen] = useState(false);
  const { alert, actorRound } = entry;
  const Icon = alertIcon(alert.type);
  const phase = alert.resolvedPhase;
  const summary = alertSummary(alert, t, tableText);
  return (
    <>
      <ButtonBase onClick={() => setOpen(true)} sx={LOG_ROW_SX}>
        <Typography variant="caption" color="text.secondary">
          {phase && phase >= 1 && phase <= 4 ? phase : ''}
        </Typography>
        <Box sx={{ display: 'flex', color: 'warning.main' }}>
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: factionColor(actorRound.factionId) }}
          />
          <Typography variant="body2" noWrap>
            <Box component="span" sx={{ fontWeight: 600 }}>
              {actorRound.actorName}
            </Box>
            {` · ${alertName(alert, t)}${summary ? ` · ${summary}` : ''}`}
          </Typography>
        </Stack>
      </ButtonBase>
      {open && <AlertLogDialog entry={entry} open={open} onClose={() => setOpen(false)} />}
    </>
  );
};

const LogLine: FC<{ item: LogItem }> = ({ item }) =>
  item.kind === 'action' ? <LogEntry action={item.action} /> : <AlertEntry entry={item.entry} />;

const itemKey = (item: LogItem) => (item.kind === 'action' ? item.action.id : item.entry.alert.id);

/** One line of the log: phase span, actor, action and its result. Clicking it opens the action. */
const LogEntry: FC<{ action: Action }> = ({ action }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const { openAction } = useCombatPanel();
  const factionColor = useFactionColor();
  const openRounds = useOpenRounds();
  const actorRound = actorRounds?.find((ar) => ar.actorId === action.actorId);
  const info = actionTypeInfo(action.actionType);
  const effects = action.status === 'completed' ? attackEffects(action) : [];
  const phases =
    action.phaseEnd && action.phaseEnd !== action.phaseStart
      ? `${action.phaseStart}–${action.phaseEnd}`
      : `${action.phaseStart}`;
  return (
    <ButtonBase
      onClick={() => openAction(action)}
      sx={LOG_ROW_SX}
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
            <Box component="span" sx={{ fontWeight: 600 }}>
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
 * What happened in the displayed round, grouped by phase and built from the round's actions (declared, resolved,
 * results, and the effects left by attacks) and its resolved alerts (workspace spec 087). Filters by actor and by kind.
 */
const RoundLog: FC = () => {
  const { t } = useTranslation();
  const { actorRounds, roundActions, displayRound } = useContext(CombatContext)!;
  const [actorId, setActorId] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const actions = (roundActions ?? []).filter((a) => (!actorId || a.actorId === actorId) && matchesType(a, type));
  const alerts =
    type === 'all' || type === 'alerts'
      ? resolvedAlerts(actorRounds, displayRound).filter((e) => !actorId || e.actorRound.actorId === actorId)
      : [];
  const order = (actorRounds ?? []).map((ar) => ar.actorId);
  const actorOf = (item: LogItem) => (item.kind === 'action' ? item.action.actorId : item.entry.actorRound.actorId);
  const byPhase = LOG_PHASES.map((phase) => ({
    phase,
    items: [
      ...(phase !== null && phase >= 1 && phase <= 4 ? actions.filter((a) => a.phaseStart === phase) : []).map(
        (action): LogItem => ({ kind: 'action', action })
      ),
      ...alerts
        .filter((e) => (e.alert.resolvedPhase ?? null) === phase)
        .map((entry): LogItem => ({ kind: 'alert', entry })),
    ].sort((a, b) => order.indexOf(actorOf(a)) - order.indexOf(actorOf(b))),
  })).filter((group) => group.items.length > 0);

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
      {byPhase.length === 0 && <EmptyState dense title={t('log-empty', { round: displayRound })} />}
      {byPhase.map((group) => (
        <Box key={group.phase ?? 'none'}>
          <SectionLabel>{phaseLabel(group.phase, t)}</SectionLabel>
          <Stack>
            {group.items.map((item) => (
              <LogLine key={itemKey(item)} item={item} />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

const STRIP_KEY = 'rmu.combat.log-strip';
const STRIP_ENTRIES = 5;

/** Under the board (wide screens): the last resolved actions and alerts of the round, collapsible, with a link to the log. */
export const RoundLogStrip: FC<{ onOpenLog: () => void }> = ({ onOpenLog }) => {
  const { t } = useTranslation();
  const { roundActions, actorRounds, displayRound } = useContext(CombatContext)!;
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
  const latest = [
    ...(roundActions ?? [])
      .filter((a) => a.status === 'completed')
      .map((action) => ({ item: { kind: 'action', action } as LogItem, phase: action.phaseEnd ?? action.phaseStart })),
    ...resolvedAlerts(actorRounds, displayRound).map((entry) => ({
      item: { kind: 'alert', entry } as LogItem,
      phase: entry.alert.resolvedPhase ?? 5,
    })),
  ]
    .sort((a, b) => b.phase - a.phase)
    .slice(0, STRIP_ENTRIES);

  return (
    <Panel
      dense
      title={t('latest-results')}
      extra={
        <>
          <Button size="small" onClick={onOpenLog}>
            {t('see-all')}
          </Button>
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
        </>
      }
    >
      <Collapse in={open}>
        {latest.length === 0 ? (
          <EmptyState dense title={t('no-results-yet')} />
        ) : (
          latest.map(({ item }) => <LogLine key={itemKey(item)} item={item} />)
        )}
      </Collapse>
    </Panel>
  );
};

export default RoundLog;
