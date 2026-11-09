import { useTranslation } from 'react-i18next';
import { CombatActionType, FALL_CONTROL_PURPOSE, GRAPPLE_ESCAPE_PURPOSE } from '@labcabrera-rmu/rmu-react-shared-lib';
import { canHeal } from '../../actor-round/medical/medical';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound } from '../../combat/combat-context';
import { useOpenRounds } from '../../hooks/useOpenRounds';
import { actorRoundGrapples, isActorRoundFearBlocked } from '../../services/actor-round-service';
import { apProfileLabel, COMBAT_TALENT_PURPOSE_AP } from '../../services/ap-service';
import {
  aimWeapons,
  availableCombatTalentPurposes,
  quickCasterLists,
  SHARPSHOOTER,
  traitTier,
} from '../../services/combat-talents-service';
import { actionTypeInfo } from '../board/action-type-info';
import { actionLabel } from '../board/action-view';
import { actorCharacter, isCaster } from '../dialogs/SpellDeclareDialog';
import { GRAPPLE_ESCAPE_AP, isObjectGrapple } from '../flows/maneuver/GrappleEscapeFlow';
import {
  entryApProfile,
  entryUnavailable,
  paletteAvailability,
  PaletteEntry,
  PaletteGroup,
  USE_ITEM,
} from './palette-rules';

/** Entries of the palette for an actor in a phase, with the reason of the ones that are not available. */
export const usePaletteGroups = (actorRound: ActorRound, phase: number, currentPhase: number): PaletteGroup[] => {
  const { t } = useTranslation();
  const { characters } = useCombatGame();
  const { roundActions, actorRounds } = useCombatRound();
  const openRounds = useOpenRounds();
  const availability = paletteAvailability(actorRound, roundActions ?? [], phase, currentPhase);
  const { fear } = availability;

  const entry = (type: CombatActionType, extra: Partial<PaletteEntry> = {}): PaletteEntry => {
    const profile = entryApProfile(type, extra);
    const warnings: string[] = [];
    if (profile && profile.min > availability.remaining)
      warnings.push(
        `${t('declare-warning-unreachable', { min: profile.min })} ${t(openRounds ? 'continues-next-round' : 'expires-at-round-end')}`
      );
    if (!extra.freeAction && !extra.forced && type !== 'movement')
      availability.interrupted.forEach((open) =>
        warnings.push(
          t(open.actionType === 'medical' ? 'declare-warning-interrupts-treatment' : 'declare-warning-interrupts', {
            action: actionLabel(open, t, actorRounds),
          })
        )
      );
    if (type === 'melee_attack' && !extra.forced && (fear === 'fear-retreat' || fear === 'fear-balk'))
      warnings.push(t(`fear-charge-${fear}`));
    return {
      key: extra.key ?? type,
      type,
      label: extra.label ?? t(actionTypeInfo(type).labelKey),
      profile: profile ? apProfileLabel(profile, t) : t('ap-profile-by-skill'),
      warnings,
      ...extra,
      unavailable: entryUnavailable(availability, type, extra),
    };
  };

  const melee = actorRound.attacks.some((a) => a.type === 'melee');
  const ranged = actorRound.attacks.some((a) => a.type === 'ranged');
  const afraid = isActorRoundFearBlocked(actorRound) ? 'err-action-fear' : undefined;
  // Spells come from the spellbook of a strategic character (spec 030): NPCs cast none yet.
  const caster = isCaster(actorCharacter(actorRound, characters));
  const sharpshooter = traitTier(actorRound, SHARPSHOOTER) > 0;
  const noSpells = actorRound.actorType === 'npc' ? 'npc-no-spells' : 'no-spellbook';
  // Workspace spec 077: one line per grapple of the actor, its grappler (or an object) and its percent
  const grapples = actorRoundGrapples(actorRound);
  const grappleLines = grapples.map((grapple) =>
    [
      isObjectGrapple(grapple)
        ? t('effect-grappled-object')
        : t('effect-grappled-by', {
            name: actorRounds?.find((each) => each.actorId === grapple.targetActorId)?.actorName ?? '',
          }),
      `${grapple.value ?? 0} %`,
      grapple.data?.tightened ? t('effect-grappled-tightened') : null,
    ]
      .filter(Boolean)
      .join(' · ')
  );
  // Workspace spec 077, decision C4: Quick-Caster shortens the casts of its lists (the API gives the action its range)
  const quickCasterLines = quickCasterLists(actorRound).map(({ listCode, tier }) =>
    t('quick-caster-palette', {
      list: t(listCode, { defaultValue: listCode }),
      profile: apProfileLabel(tier >= 2 ? { min: 2, max: 2 } : { min: 2, max: 3 }, t),
    })
  );
  // Attacks are never free (spec 011, §6): an immediate attack granted by an effect is a forced action.
  const groups: PaletteGroup[] = [
    {
      key: 'movement',
      label: t('movement'),
      entries: [
        entry('movement', {
          label: t('normal-movement'),
          unavailable: availability.moving ? 'already-moving' : undefined,
        }),
        entry('movement', {
          key: 'free-movement',
          label: t('free-movement'),
          freeAction: true,
          // Workspace spec 080 (Core Law §8.2): no AP and not the instantaneous action; up to run, with a pace penalty
          details: [t('free-movement-palette-help')],
          unavailable: availability.moving ? 'already-moving' : undefined,
        }),
      ],
    },
    {
      key: 'combat',
      label: t('combat'),
      entries: [
        entry('melee_attack', { unavailable: !melee ? 'no-melee-attacks' : afraid }),
        entry('ranged_attack', { unavailable: !ranged ? 'no-ranged-attacks' : afraid }),
        entry('melee_attack', {
          key: 'forced-melee-attack',
          label: t('immediate-melee-attack'),
          forced: 'effect',
          unavailable: !melee ? 'no-melee-attacks' : afraid,
        }),
        entry('ranged_attack', {
          key: 'forced-ranged-attack',
          label: t('immediate-ranged-attack'),
          forced: 'effect',
          unavailable: !ranged ? 'no-ranged-attacks' : afraid,
        }),
        // A full dodge or block takes the 4 AP of the round (§9.6): it can only start in phase 1.
        entry('dodge', { unavailable: phase > 1 ? 'err-full-defense-action-points' : undefined }),
        entry('draw_and_load'),
        // Workspace spec 076, decision B6: aiming only with Sharpshooter, for a ranged weapon of its specialization
        ...(sharpshooter
          ? [entry('aim', { unavailable: aimWeapons(actorRound).length === 0 ? 'no-aim-weapons' : afraid })]
          : []),
      ],
    },
    {
      key: 'maneuvers',
      label: t('maneuvers'),
      entries: [
        entry('maneuver'),
        entry('perception'),
        // Workspace spec 068: a medical action on a patient (4 AP a round) and a healing item (2 AP)
        entry('medical', { unavailable: canHeal(actorRound) ? undefined : 'err-healer-not-able' }),
        entry(USE_ITEM, { unavailable: actorRound.characterId ? undefined : 'use-item-npc' }),
        // Workspace spec 076, §2.6: the maneuvers of the combat talents of the actor
        ...(grapples.length > 0
          ? [
              entry('maneuver', {
                key: GRAPPLE_ESCAPE_PURPOSE,
                label: t('grapple-escape'),
                grappleEscape: true,
                ap: GRAPPLE_ESCAPE_AP,
                details: grappleLines,
              }),
            ]
          : []),
        // Workspace spec 077, decision D4: Acrobatics to control a fall, instantaneous
        entry('maneuver', {
          key: FALL_CONTROL_PURPOSE,
          label: t('fall-control'),
          freeAction: true,
          fallControl: true,
          details: [t('fall-control-palette-help')],
        }),
        // Workspace spec 079, B4: Fortitude, instantaneous
        entry('maneuver', {
          key: 'fortitude',
          label: t('fortitude'),
          freeAction: true,
          fortitude: true,
          details: [t('fortitude-palette-help')],
        }),
        ...availableCombatTalentPurposes(actorRound).map((purpose) =>
          entry('maneuver', {
            key: `purpose-${purpose}`,
            label: t(purpose),
            purpose,
            ap: COMBAT_TALENT_PURPOSE_AP[purpose],
          })
        ),
      ],
    },
    {
      key: 'magic',
      label: t('magic'),
      entries: [
        entry('cast_spell', { unavailable: caster ? undefined : noSpells, details: quickCasterLines }),
        entry('cast_instant', { freeAction: true, unavailable: caster ? undefined : noSpells }),
      ],
    },
    { key: 'other', label: t('other'), entries: [entry('other')] },
  ];
  // A forced action always starts in the current phase.
  return availability.retroactive
    ? groups.map((group) => ({ ...group, entries: group.entries.filter((e) => !e.forced) }))
    : groups;
};
