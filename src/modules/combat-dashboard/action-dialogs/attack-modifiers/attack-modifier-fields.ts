import { ActionAttackModifiers } from '../../../api/action.dto';

export type AttackKind = 'melee' | 'ranged';
export type ModifierFieldGroup = 'offense' | 'defense' | 'situation';
export type ModifierOption = { key: string; value: number | null };

type Base = {
  name: keyof ActionAttackModifiers;
  /** i18n key of the label. */
  label: string;
  group: ModifierFieldGroup;
  /** Attack kinds it applies to (both when omitted). */
  appliesTo?: AttackKind[];
};

/**
 * On/off modifier. `bonus` is the value it adds to the roll, shown on the chip as a hint (the API computes the
 * real value); `null` when it has no fixed value, as with the DB or shield disables.
 */
export type FlagField = Base & { kind: 'flag'; bonus: (kind: AttackKind) => number | null };
export type ChoiceField = Base & { kind: 'choice'; options: (kind: AttackKind) => ModifierOption[]; defaultValue: string };
export type NumberField = Base & { kind: 'number'; visible?: (modifiers: ActionAttackModifiers) => boolean };
export type ModifierField = FlagField | ChoiceField | NumberField;

const opts = (entries: [string, number | null][]): ModifierOption[] => entries.map(([key, value]) => ({ key, value }));

const COVER = {
  melee: opts([
    ['none', 0],
    ['soft_partial', -10],
    ['soft_half', -20],
    ['soft_full', -50],
    ['hard_partial', -20],
    ['hard_half', -40],
    ['hard_full', -100],
  ]),
  ranged: opts([
    ['none', 0],
    ['soft_partial', -20],
    ['soft_half', -40],
    ['soft_full', -100],
    ['hard_partial', -40],
    ['hard_half', -80],
    ['hard_full', -200],
  ]),
};

/**
 * Every modifier the attacker can declare, in display order. The values mirror the combat plugins of
 * rmu-api-tactical and are only hints: the breakdown returned by the API after Prepare is the reference.
 */
export const ATTACK_MODIFIER_FIELDS: ModifierField[] = [
  // Attacker
  {
    kind: 'choice',
    name: 'pace',
    label: 'pace',
    group: 'offense',
    defaultValue: 'creep',
    options: () =>
      opts([
        ['creep', 0],
        ['walk', -25],
        ['jog', -50],
        ['run', -75],
      ]),
  },
  {
    kind: 'choice',
    name: 'chargeSpeed',
    label: 'charge-speed',
    group: 'offense',
    appliesTo: ['melee'],
    defaultValue: 'none',
    options: () =>
      opts([
        ['none', null],
        ['jog', null],
        ['sprint', null],
      ]),
  },
  {
    kind: 'choice',
    name: 'calledShot',
    label: 'called-shot',
    group: 'offense',
    defaultValue: 'none',
    options: () => opts(['none', 'head', 'chest', 'abdomen', 'arms', 'legs'].map((key) => [key, key === 'none' ? 0 : -25])),
  },
  { kind: 'number', name: 'calledShotPenalty', label: 'called-shot-penalty', group: 'offense', visible: (m) => !!m.calledShot && m.calledShot !== 'none' },
  { kind: 'flag', name: 'proneSource', label: 'attacker-prone', group: 'offense', bonus: () => -50 },
  { kind: 'flag', name: 'attackerInMelee', label: 'in-melee', group: 'offense', appliesTo: ['ranged'], bonus: () => -20 },
  { kind: 'flag', name: 'ambush', label: 'ambush', group: 'offense', bonus: () => null },
  { kind: 'number', name: 'customBonus', label: 'custom-bonus', group: 'offense' },
  // Target
  { kind: 'flag', name: 'stunnedFoe', label: 'target-stunned', group: 'defense', bonus: () => 20 },
  { kind: 'flag', name: 'surprisedFoe', label: 'target-surprised', group: 'defense', bonus: () => 25 },
  { kind: 'flag', name: 'proneTarget', label: 'target-prone', group: 'defense', bonus: (kind) => (kind === 'melee' ? 30 : -30) },
  { kind: 'flag', name: 'disabledDB', label: 'ignore-db', group: 'defense', bonus: () => null },
  { kind: 'flag', name: 'disabledShield', label: 'ignore-shield', group: 'defense', bonus: () => null },
  { kind: 'flag', name: 'disabledParry', label: 'no-parry', group: 'defense', appliesTo: ['melee'], bonus: () => null },
  { kind: 'flag', name: 'restrictedParry', label: 'restricted-parry', group: 'defense', appliesTo: ['melee'], bonus: () => null },
  {
    kind: 'choice',
    name: 'dodge',
    label: 'dodge',
    group: 'defense',
    defaultValue: 'none',
    options: () => opts(['none', 'passive', 'partial', 'full'].map((key) => [key, null])),
  },
  // Situation
  {
    kind: 'choice',
    name: 'positionalSource',
    label: 'positional-source',
    group: 'situation',
    appliesTo: ['melee'],
    defaultValue: 'none',
    options: () =>
      opts([
        ['none', 0],
        ['to_flank', -30],
        ['to_rear', -70],
      ]),
  },
  {
    kind: 'choice',
    name: 'positionalTarget',
    label: 'positional-target',
    group: 'situation',
    appliesTo: ['melee'],
    defaultValue: 'none',
    options: () =>
      opts([
        ['none', 0],
        ['flank', 15],
        ['rear', 35],
      ]),
  },
  { kind: 'choice', name: 'cover', label: 'cover', group: 'situation', defaultValue: 'none', options: (kind) => COVER[kind] },
  {
    kind: 'choice',
    name: 'restrictedQuarters',
    label: 'restricted-quarters',
    group: 'situation',
    defaultValue: 'none',
    options: () =>
      opts([
        ['none', 0],
        ['close', -25],
        ['cramped', -50],
        ['tight', -75],
        ['confined', -100],
      ]),
  },
  { kind: 'flag', name: 'higherGround', label: 'higher-ground', group: 'situation', bonus: () => 10 },
];

export const fieldsFor = (kind: AttackKind) => ATTACK_MODIFIER_FIELDS.filter((field) => !field.appliesTo || field.appliesTo.includes(kind));

/** Whether a field has a value other than its default (shown in the summary). */
export const isDeclared = (field: ModifierField, modifiers: ActionAttackModifiers): boolean => {
  const value = modifiers[field.name];
  if (field.kind === 'flag') return value === true;
  if (field.kind === 'choice') return !!value && value !== field.defaultValue;
  return typeof value === 'number' && value !== 0 && (!field.visible || field.visible(modifiers));
};

/** Hint value of a declared field, when it has a fixed one. */
export const declaredValue = (field: ModifierField, modifiers: ActionAttackModifiers, kind: AttackKind): number | null => {
  const value = modifiers[field.name];
  if (field.kind === 'flag') return field.bonus(kind);
  if (field.kind === 'choice') {
    if (field.name === 'calledShot') return (modifiers.calledShotPenalty as number | null) ?? -25;
    return field.options(kind).find((option) => option.key === value)?.value ?? null;
  }
  if (field.name === 'calledShotPenalty') return null; // already counted with the called shot
  return typeof value === 'number' ? value : null;
};
