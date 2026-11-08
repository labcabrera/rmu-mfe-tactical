import type { TFunction } from 'i18next';
import AirIcon from '@mui/icons-material/Air';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import BoltIcon from '@mui/icons-material/Bolt';
import CallMissedOutgoingIcon from '@mui/icons-material/CallMissedOutgoing';
import CasinoIcon from '@mui/icons-material/Casino';
import DangerousIcon from '@mui/icons-material/Dangerous';
import GroupsIcon from '@mui/icons-material/Groups';
import HealingIcon from '@mui/icons-material/Healing';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { formatBonus, KeyValueRow } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { reactionAttackLabel } from '../actor-alert-dialogs/CombatTalentAlertDialog';

/** A resolved alert with the actor round it belongs to. */
export type LoggedAlert = { alert: ActorRoundAlert; actorRound: ActorRound };

type TableText = (text: string | null | undefined) => string;

const ALERT_ICONS: Record<string, typeof BoltIcon> = {
  endurance: BatteryAlertIcon,
  breakage: HeartBrokenIcon,
  critical: WhatshotIcon,
  'frenzy-dying': LocalFireDepartmentIcon,
  'wound-reopened': BloodtypeIcon,
  'tourniquet-loosen': HealingIcon,
  'limb-loss': PersonOffIcon,
  'fear-check-suggested': GroupsIcon,
  'revulsion-rr': SentimentVeryDissatisfiedIcon,
  'reaction-available': BoltIcon,
  'terrible-luck': CasinoIcon,
  'mental-focus': PsychologyIcon,
  'fall-suggested': TrendingDownIcon,
  'death-threshold': DangerousIcon,
  'knocked-back': KeyboardDoubleArrowLeftIcon,
  'stray-shot': CallMissedOutgoingIcon,
  'breath-check': AirIcon,
};

export const alertIcon = (type: string) => ALERT_ICONS[type] ?? NotificationsNoneIcon;

/**
 * Workspace spec 087: the alerts resolved in a round. Each one stays in the actor round of the round it was resolved
 * in, and those resolved before the spec have no `resolvedRound` and are left out.
 */
export const resolvedAlerts = (actorRounds: ActorRound[] | null, round: number | null): LoggedAlert[] =>
  (actorRounds ?? []).flatMap((actorRound) =>
    (actorRound.alerts ?? [])
      .filter((alert) => alert.status === 'resolved' && alert.resolvedRound === round)
      .map((alert) => ({ alert, actorRound }))
  );

export const alertName = (alert: ActorRoundAlert, t: TFunction): string =>
  alert.type === 'reaction-available' ? reactionAttackLabel(alert, t) : t(`alert-${alert.type}`);

/** Name of a group of the log: 0 is the declaration of initiative, 5 the upkeep and null a phase not known. */
export const phaseLabel = (phase: number | null, t: TFunction): string => {
  if (phase === null) return t('alert-log-no-phase');
  if (phase === 0) return t('initiative');
  if (phase === 5) return t('upkeep');
  return t('phase-n', { phase });
};

const outcomeLabel = (alert: ActorRoundAlert, t: TFunction): string => {
  const outcome = alert.result?.outcome;
  if (!outcome) return '';
  if (alert.type === 'breakage') return t(`breakage-result-${outcome}`);
  const generic = t(`alert-outcome-${outcome}`, { defaultValue: outcome });
  // A failed RR of Revulsion keeps the severity of the failure
  return alert.type === 'revulsion-rr' ? t(`fear-severity-${outcome}`, { defaultValue: generic }) : generic;
};

/** The item of a breakage or the text of a critical. */
export const alertText = (alert: ActorRoundAlert, t: TFunction, tableText: TableText): string => {
  const text = alert.result?.text;
  if (!text) return '';
  return alert.type === 'critical' ? tableText(text) : t(text, { defaultValue: text });
};

const isPresent = <T>(value: T | null | undefined): value is T => value !== null && value !== undefined;

/** One short line for the log: `Arming sword — partial success (78)`, or `63, +10 fatigue` for an endurance roll. */
export const alertSummary = (alert: ActorRoundAlert, t: TFunction, tableText: TableText): string => {
  const result = alert.result;
  if (!result) return '';
  if (alert.type === 'endurance') {
    return t('alert-log-endurance', {
      total: result.total ?? result.roll,
      fatigue: formatBonus(Number(result.values?.fatigue ?? 0)),
    });
  }
  const score = result.total ?? result.roll;
  const outcome = [outcomeLabel(alert, t), isPresent(score) ? `(${score})` : ''].filter(Boolean).join(' ');
  return [alertText(alert, t, tableText), outcome].filter(Boolean).join(' — ');
};

/** Result values shown in the detail: the identifiers are left out. Key of the value and key of its label. */
const VALUE_LABELS: Record<string, string> = {
  fatigue: 'fatigue',
  hits: 'hits',
  damage: 'damage',
  location: 'location',
  broken: 'alert-log-broken',
  criticalKey: 'alert-critical',
  attackLevel: 'attack-level',
  fearState: 'alert-log-fear-state',
  frightLevel: 'fright-level',
  afraid: 'alert-log-afraid',
  resisted: 'alert-log-resisted',
};

/** What raised the alert, shown in the detail: the technical modifiers (identifiers, flags) are left out. */
const MODIFIER_LABELS: Record<string, string> = {
  origin: 'source',
  penalty: 'penalty',
  level: 'level',
  frightLevel: 'fright-level',
  attackLevel: 'attack-level',
  location: 'location',
  skillId: 'skill',
  difficulty: 'difficulty',
  criticalSeverity: 'critical-severity',
  attackName: 'attack-name',
  bleeding: 'bleeding',
};

const valueText = (key: string, value: number | string | boolean, t: TFunction): string | number => {
  if (typeof value === 'boolean') return t(value ? 'yes' : 'no');
  if (key === 'fearState') return t(`fear-${value}`);
  if (key === 'fatigue') return formatBonus(Number(value));
  return typeof value === 'string' ? t(value, { defaultValue: value }) : value;
};

/** Rows of the read-only detail of a resolved alert. */
export const alertDetailRows = (alert: ActorRoundAlert, t: TFunction): KeyValueRow[] => {
  const result = alert.result;
  const values = result?.values ?? {};
  const rows: (KeyValueRow | null)[] = [
    isPresent(alert.raisedRound) ? { label: t('alert-log-raised-round'), value: alert.raisedRound } : null,
    isPresent(alert.resolvedRound) ? { label: t('alert-log-resolved-round'), value: alert.resolvedRound } : null,
    { label: t('phase'), value: phaseLabel(alert.resolvedPhase ?? null, t) },
    isPresent(result?.roll) ? { label: t('roll'), value: result.roll } : null,
    isPresent(result?.total) ? { label: t('total'), value: result.total } : null,
    result?.outcome ? { label: t('result'), value: outcomeLabel(alert, t) } : null,
    ...Object.entries(values).map(([key, value]) =>
      VALUE_LABELS[key] && isPresent(value) ? { label: t(VALUE_LABELS[key]), value: valueText(key, value, t) } : null
    ),
    ...(alert.modifiers ?? []).map((modifier) => {
      const value = modifier.value ?? modifier.modifier;
      return MODIFIER_LABELS[modifier.key] && !(modifier.key in values) && isPresent(value)
        ? { label: t(MODIFIER_LABELS[modifier.key]), value: valueText(modifier.key, value, t) }
        : null;
    }),
  ];
  return rows.filter(isPresent);
};
