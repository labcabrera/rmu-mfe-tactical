import type { ActorRound } from '../api/actor-rounds.dto';

// Frenzy of the Character Companion talents (workspace spec 040): what the board needs to enter and leave it with an
// Adrenal Focus maneuver and to show it. The API checks and applies every rule; these only shape the forms.

export type FrenzyPurpose = 'frenzy-enter' | 'frenzy-enter-greater' | 'frenzy-exit';

export const ADRENAL_FOCUS_SKILL_ID = 'adrenal-focus';
const GREATER_FRENZY_MODIFIER = -30;
const IMPROVED_FRENZY_BONUS = 10;

const hasTrait = (actorRound: ActorRound, traitId: string) =>
  (actorRound.traits ?? []).some((trait) => trait.traitId === traitId);

/** 0 when the actor is not in frenzy, 1 in frenzy, 2 in greater frenzy. */
export const frenzyLevel = (actorRound: ActorRound | undefined | null): number =>
  actorRound?.effects?.find((effect) => effect.status === 'frenzy')?.value ?? 0;

export const isFrenzyDying = (actorRound: ActorRound | undefined | null): boolean =>
  !!actorRound?.effects?.some((effect) => effect.status === 'frenzy-dying');

/** Purposes the actor can choose for an Adrenal Focus maneuver: none without the Frenzy talents. */
export const frenzyPurposes = (actorRound: ActorRound, skillId: string): FrenzyPurpose[] => {
  if (skillId !== ADRENAL_FOCUS_SKILL_ID) return [];
  const greater = hasTrait(actorRound, 'frenzy-greater');
  if (!greater && !hasTrait(actorRound, 'frenzy')) return [];
  const level = frenzyLevel(actorRound);
  const purposes: FrenzyPurpose[] = [];
  if (level === 0) purposes.push('frenzy-enter');
  if (greater && level < 2) purposes.push('frenzy-enter-greater');
  if (level > 0) purposes.push('frenzy-exit');
  return purposes;
};

/** Modifiers the API adds to the frenzy maneuver, in its order: Greater Frenzy -30, Improved Frenzy +10. */
export const frenzyManeuverModifiers = (
  actorRound: ActorRound,
  purpose: FrenzyPurpose | null
): { key: string; value: number }[] => {
  if (!purpose) return [];
  const modifiers: { key: string; value: number }[] = [];
  if (purpose === 'frenzy-enter-greater' || (purpose === 'frenzy-exit' && frenzyLevel(actorRound) === 2)) {
    modifiers.push({ key: 'frenzy-greater', value: GREATER_FRENZY_MODIFIER });
  }
  const style = actorRound.activeStyle;
  if (style?.met && style.abilities?.some((ability) => ability.abilityId === 'improved-frenzy' && ability.met)) {
    modifiers.push({ key: 'improved-frenzy', value: IMPROVED_FRENZY_BONUS });
  }
  return modifiers;
};
