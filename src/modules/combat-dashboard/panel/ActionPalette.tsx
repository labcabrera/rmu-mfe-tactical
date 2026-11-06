import React, { FC, KeyboardEvent, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import BackHandIcon from '@mui/icons-material/BackHand';
import {
  Alert,
  Box,
  Button,
  Drawer,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  MenuList,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import {
  CombatActionType,
  CombatTalentPurpose,
  combatColors,
  FALL_CONTROL_PURPOSE,
  FORTITUDE_SKILL_ID,
  FALL_CONTROL_SKILL,
  GRAPPLE_ESCAPE_PURPOSE,
  SearchField,
  SectionLabel,
  usePhone,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { canHeal } from '../../actor-round/medical/medical';
import { createAction } from '../../api/action';
import { Action, ActionApProfile, ActionType, ForceReason } from '../../api/action.dto';
import { dropActorRoundItems } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useActionConfirm, useNotifyWarnings } from '../../services/action-warnings';
import { actorRoundGrapples, actorRoundHasEffect, isActorRoundFearBlocked } from '../../services/actor-round-service';
import {
  apCapacity,
  apProfileLabel,
  apRemaining,
  COMBAT_TALENT_PURPOSE_AP,
  DECLARE_AP_PROFILES,
  freeInstantsPerRound,
  isActionOpen,
  useOpenRounds,
} from '../../services/ap-service';
import {
  aimWeapons,
  availableCombatTalentPurposes,
  COMBAT_TALENT_PURPOSE_SKILLS,
  quickCasterLists,
  rememberPurpose,
  SHARPSHOOTER,
  traitTier,
} from '../../services/combat-talents-service';
import { useTacticalNotify } from '../../services/notify-service';
import { actionTypeInfo } from '../actor-rounds/action-type-info';
import { actionLabel } from '../actor-rounds/action-view';
import ManeuverDeclareDialog from './ManeuverDeclareDialog';
import MedicalDeclareDialog from './MedicalDeclareDialog';
import OtherActionDeclareDialog from './OtherActionDeclareDialog';
import SpellDeclareDialog, { actorCharacter, isCaster } from './SpellDeclareDialog';
import UseItemDeclareDialog from './UseItemDeclareDialog';
import WeaponActionDeclareDialog, { WeaponActionDeclaration } from './WeaponActionDeclareDialog';
import { GRAPPLE_ESCAPE_AP, GRAPPLE_ESCAPE_SKILLS, isObjectGrapple } from './flows/maneuver/GrappleEscapeFlow';

type PaletteEntry = {
  key: string;
  type: CombatActionType;
  label: string;
  freeAction?: boolean;
  /** Declared already forced (spec 011, §6): an immediate attack granted by an effect, out of turn and without AP. */
  forced?: ForceReason;
  /** Translation key of the reason why it cannot be declared now. */
  unavailable?: string;
  /** AP range of the entry ("2-4 AP"), shown under its name. */
  profile?: string;
  /** What declaring it does that the user should know: it will not reach its minimum AP, or interrupts an action. */
  warnings?: string[];
  /** AP range of the entry when its type does not give it (a combat talent maneuver). */
  ap?: ActionApProfile;
  /** Maneuver of a combat talent (workspace spec 076): declared with its skill, its purpose chosen in the flow. */
  purpose?: CombatTalentPurpose;
  /** "Break free" from the grapples of the actor (workspace spec 077): a percent maneuver of Wrestling or Contortions. */
  grappleEscape?: boolean;
  /** "Fall control" (workspace spec 077): an instantaneous Acrobatics maneuver, 0 AP, cited by a fall. */
  fallControl?: boolean;
  /** Fortitude (workspace spec 079, B4): an instantaneous absolute maneuver, 0 AP, that halves the penalties. */
  fortitude?: boolean;
  /** Lines shown under the entry: the grapples of "Break free", with their grappler and percent. */
  details?: string[];
};

type PaletteGroup = { key: string; label: string; entries: PaletteEntry[] };

/** Palette entries declared as a maneuver with a fixed skill (the API resolves them as maneuvers). */
const SKILL_MANEUVERS: Partial<Record<CombatActionType, string>> = { perception: 'perception' };

/** A healing item of 2 AP (workspace spec 068): a type of the API the shared lib does not list yet. */
const USE_ITEM = 'use_item' as CombatActionType;

/** Actions on a weapon (workspace spec 076): the weapon drawn, or the foe and weapon aimed with. */
const WEAPON_ENTRIES: CombatActionType[] = ['draw_and_load', 'aim'];

/** The fear state of the actor (§14.3, workspace spec 068), the worst one. */
export const actorFearState = (actorRound: ActorRound): string | undefined =>
  ['fear-broken', 'fear-routed', 'fear-retreat', 'fear-balk'].find((state) => actorRoundHasEffect(actorRound, [state]));

/** Entries of the palette for an actor in a phase, with the reason of the ones that are not available. */
const usePaletteGroups = (actorRound: ActorRound, phase: number): PaletteGroup[] => {
  const { t } = useTranslation();
  const { roundActions, actorRounds, characters } = useContext(CombatContext)!;
  const openRounds = useOpenRounds();
  const actions = roundActions ?? [];
  const own = actions.filter((a) => a.actorId === actorRound.actorId);
  // A movement is declared only once per phase: none of the actor's movements may cover it (one not finished
  // yet covers up to the current phase, as in the API).
  const moving = own.some(
    (a) => a.actionType === 'movement' && a.phaseStart <= phase && phase <= (a.phaseEnd ?? phase)
  );
  // Declaring a new action interrupts the open one (spec 011, §5.5): its AP stay spent. Moving at the same time
  // interrupts nothing, nor do free actions.
  const interrupted = own.filter((a) => isActionOpen(a) && a.actionType !== 'movement' && !a.freeAction);

  // §8.3 Surprise: a flatfooted actor declares nothing this round, and one without AP in this phase (a surprised one
  // loses its first phases) declares nothing in it. The reasons reuse the messages of the API errors.
  const flatfooted = actorRound.effects?.some((e) => e.status === 'flatfooted');
  const surprise = actorRound.effects?.find((e) => e.status === 'surprised');
  const noCapacity = actorRound.apCapacity
    ? apCapacity(actorRound)[phase - 1] === 0
    : !!surprise && phase <= (surprise.value ?? 2);
  const roundReason = flatfooted
    ? 'err-action-flatfooted'
    : noCapacity
      ? surprise
        ? 'err-action-surprised-phase'
        : 'no-ap-in-phase'
      : undefined;
  // Workspace spec 068, decision 14: routed and broken actors only move, dodge or take actions of 0 AP (the first
  // free action of the round); a retreating one cannot charge and a balking one is warned.
  const fear = actorFearState(actorRound);
  const fleeing = fear === 'fear-routed' || fear === 'fear-broken';
  // Quick Action (workspace spec 076): the first two instantaneous actions take no AP
  const firstFree =
    own.filter((a) => a.freeAction && !a.attacks?.length).length < freeInstantsPerRound(actorRound, 'other');
  const fearReason = (type: CombatActionType, free: boolean): string | undefined => {
    if (!fleeing || type === 'movement' || type === 'dodge' || (free && firstFree)) return undefined;
    return `palette-fear-only-flee-${fear}`;
  };
  // AP the actor can still spend this round: the open action gives back the AP of this phase when interrupted.
  const remaining = apRemaining(actorRound, phase) + (interrupted.length > 0 ? 1 : 0);

  const entry = (type: CombatActionType, extra: Partial<PaletteEntry> = {}): PaletteEntry => {
    const profile =
      extra.freeAction || extra.forced ? { min: 0, max: 0 } : (extra.ap ?? DECLARE_AP_PROFILES[type as ActionType]);
    const warnings: string[] = [];
    if (profile && profile.min > remaining)
      warnings.push(
        `${t('declare-warning-unreachable', { min: profile.min })} ${t(openRounds ? 'continues-next-round' : 'expires-at-round-end')}`
      );
    if (!extra.freeAction && !extra.forced && type !== 'movement')
      interrupted.forEach((open) =>
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
      // A forced attack takes no AP: only a flatfooted actor cannot make it.
      unavailable:
        (extra.forced ? (flatfooted ? 'err-action-flatfooted' : undefined) : roundReason) ??
        extra.unavailable ??
        (extra.forced ? undefined : fearReason(type, !!extra.freeAction)),
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
  return [
    {
      key: 'movement',
      label: t('movement'),
      entries: [
        entry('movement', { label: t('normal-movement'), unavailable: moving ? 'already-moving' : undefined }),
        entry('movement', {
          key: 'free-movement',
          label: t('free-movement'),
          freeAction: true,
          // Workspace spec 080 (Core Law §8.2): no AP and not the instantaneous action; up to run, with a pace penalty
          details: [t('free-movement-palette-help')],
          unavailable: moving ? 'already-moving' : undefined,
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
};

/** Creates an action of an actor in a phase and adds it to the round. */
const useCreateAction = (actorRound: ActorRound | null, phase: number, onCreated: (action: Action) => void) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const notifyWarnings = useNotifyWarnings();
  const confirm = useActionConfirm();
  const { game, roundActions, setRoundActions, refreshActorRounds } = useContext(CombatContext)!;
  const [busy, setBusy] = useState(false);

  const create = (entry: PaletteEntry, extra: Record<string, unknown> = {}) => {
    if (!game || !actorRound || busy) return;
    setBusy(true);
    const body = {
      gameId: game.id,
      actorId: actorRound.actorId,
      actionType: entry.type,
      phaseStart: phase,
      freeAction: !!entry.freeAction,
      ...(entry.forced ? { forced: { reason: entry.forced } } : {}),
      ...extra,
    };
    // Workspace spec 068: interrupting a treatment or exerting with a wound that reopens asks for a confirmation
    confirm
      .run((confirmed) => createAction(confirmed ? { ...body, confirm: true } : body, auth))
      .then((action) => {
        // The interrupted actions closed: read the round again (a reopened wound changed an actor round too)
        const interrupts = (roundActions ?? []).some(
          (a) => a.actorId === action.actorId && a.id !== action.id && !a.freeAction
        );
        setRoundActions([...(roundActions ?? []), action]);
        // A combat talent maneuver: its flow starts with the purpose chosen (workspace spec 076); "Break free" opens
        // its own flow (workspace spec 077)
        if (entry.purpose) rememberPurpose(action.id, entry.purpose);
        if (entry.grappleEscape) rememberPurpose(action.id, GRAPPLE_ESCAPE_PURPOSE);
        if (entry.fallControl) rememberPurpose(action.id, FALL_CONTROL_PURPOSE);
        if (interrupts || (action.warnings ?? []).length > 0) refreshActorRounds();
        notify.success(t('action-declared', { action: entry.label }));
        notifyWarnings(action.warnings);
        onCreated(action);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };
  return { create, busy, confirmDialog: confirm.dialog };
};

type ManeuverChoice = { entry: PaletteEntry; skillId: string | null };

/** Spell casts are `cast_spell` actions; the instantaneous entry declares one as a free action. */
const SPELL_ENTRIES: CombatActionType[] = ['cast_spell', 'cast_instant'];

/**
 * Action palette of an actor: the action types grouped, filterable by typing (Enter picks the first match),
 * with the reason of the ones that cannot be declared now. Choosing one declares the action; maneuvers first
 * ask for their skill and type in a dialog. A popover, or a bottom sheet on phones.
 */
const ActionPalette: FC<{
  actorRound: ActorRound | null;
  phase: number;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onCreated: (action: Action) => void;
}> = ({ actorRound, phase, anchorEl, onClose, onCreated }) => {
  const isPhone = usePhone();
  const [maneuver, setManeuver] = useState<ManeuverChoice | null>(null);
  const [spellEntry, setSpellEntry] = useState<PaletteEntry | null>(null);
  const [healEntry, setHealEntry] = useState<PaletteEntry | null>(null);
  const [weaponEntry, setWeaponEntry] = useState<PaletteEntry | null>(null);
  const { create, busy, confirmDialog } = useCreateAction(actorRound, phase, (action) => {
    setManeuver(null);
    setSpellEntry(null);
    setHealEntry(null);
    setWeaponEntry(null);
    onCreated(action);
  });
  const close = () => {
    setManeuver(null);
    setSpellEntry(null);
    setHealEntry(null);
    setWeaponEntry(null);
    onClose();
  };
  // The palette hides while the maneuver, spell, medical, item or weapon dialog is open.
  const open = Boolean(actorRound) && !maneuver && !spellEntry && !healEntry && !weaponEntry;
  const content = actorRound && (
    <PaletteContent
      actorRound={actorRound}
      phase={phase}
      busy={busy}
      onClose={close}
      onCreate={create}
      onManeuver={setManeuver}
      onSpell={setSpellEntry}
      onHeal={setHealEntry}
      onWeapon={setWeaponEntry}
      onClosePalette={close}
    />
  );
  const dialog = (
    <ManeuverDeclareDialog
      open={Boolean(actorRound && maneuver)}
      actorRound={actorRound}
      initialSkillId={maneuver?.skillId}
      busy={busy}
      onClose={close}
      onDeclare={(declared) => maneuver && create(maneuver.entry, { maneuver: declared })}
    />
  );
  const spellDialog = (
    <SpellDeclareDialog
      open={Boolean(actorRound && spellEntry)}
      actorRound={actorRound}
      instant={!!spellEntry?.freeAction}
      busy={busy}
      onClose={close}
      onDeclare={(spell) => spellEntry && create(spellEntry, { actionType: 'cast_spell', spell })}
    />
  );
  const healDialogs = (
    <>
      <MedicalDeclareDialog
        open={Boolean(actorRound && healEntry?.type === 'medical')}
        actorRound={actorRound}
        busy={busy}
        onClose={close}
        onDeclare={(medical) => healEntry && create(healEntry, { medical })}
      />
      <UseItemDeclareDialog
        open={Boolean(actorRound && healEntry?.type === USE_ITEM)}
        actorRound={actorRound}
        busy={busy}
        onClose={close}
        onDeclare={(useItem) => healEntry && create(healEntry, { useItem })}
      />
      <OtherActionDeclareDialog
        open={Boolean(actorRound && weaponEntry?.type === 'other')}
        actorRound={actorRound}
        busy={busy}
        onClose={close}
        onDeclare={(fields) => weaponEntry && create(weaponEntry, { ...fields })}
      />
      <WeaponActionDeclareDialog
        open={Boolean(actorRound && weaponEntry && weaponEntry.type !== 'other')}
        kind={weaponEntry?.type === 'aim' ? 'aim' : 'draw_and_load'}
        actorRound={actorRound}
        busy={busy}
        onClose={close}
        onDeclare={(declaration: WeaponActionDeclaration) => weaponEntry && create(weaponEntry, declaration)}
      />
      {confirmDialog}
    </>
  );
  if (isPhone) {
    return (
      <>
        <Drawer anchor="bottom" open={open} onClose={close} slotProps={{ paper: { sx: { maxHeight: '85dvh' } } }}>
          {content}
        </Drawer>
        {dialog}
        {spellDialog}
        {healDialogs}
      </>
    );
  }
  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={close}
        // Opened from the keyboard there is no button to anchor to: show it at the top center.
        anchorReference={anchorEl ? 'anchorEl' : 'anchorPosition'}
        anchorPosition={{ top: 120, left: typeof window === 'undefined' ? 0 : window.innerWidth / 2 }}
        transformOrigin={anchorEl ? undefined : { vertical: 'top', horizontal: 'center' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 460, maxWidth: 'calc(100vw - 32px)', maxHeight: '70vh' } } }}
      >
        {content}
      </Popover>
      {dialog}
      {spellDialog}
      {healDialogs}
    </>
  );
};

const PaletteContent: FC<{
  actorRound: ActorRound;
  phase: number;
  busy: boolean;
  onClose: () => void;
  onCreate: (entry: PaletteEntry, extra?: Record<string, unknown>) => void;
  onManeuver: (choice: ManeuverChoice) => void;
  onSpell: (entry: PaletteEntry) => void;
  onHeal: (entry: PaletteEntry) => void;
  onWeapon: (entry: PaletteEntry) => void;
  onClosePalette: () => void;
}> = ({ actorRound, phase, busy, onClose, onCreate, onManeuver, onSpell, onHeal, onWeapon, onClosePalette }) => {
  const { t } = useTranslation();
  const groups = usePaletteGroups(actorRound, phase);
  const fear = actorFearState(actorRound);
  const [filter, setFilter] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        entries: group.entries.filter((e) => !term || e.label.toLowerCase().includes(term)),
      }))
      .filter((group) => group.entries.length > 0);
  }, [groups, filter]);

  const choose = (entry: PaletteEntry) => {
    if (entry.unavailable) return;
    // Perception and medical are maneuvers with their skill already chosen.
    const maneuverEntry = groups.flatMap((g) => g.entries).find((e) => e.type === 'maneuver')!;
    if (entry.grappleEscape) {
      // The skill can change in the flow: Wrestling first
      onCreate(entry, { maneuver: { skillId: GRAPPLE_ESCAPE_SKILLS[0] } });
    } else if (entry.fallControl) {
      // Instantaneous (0 AP) absolute Acrobatics: the API only takes it declared so or forced (workspace spec 077)
      onCreate(entry, { maneuver: { skillId: FALL_CONTROL_SKILL, maneuverType: 'absolute' } });
    } else if (entry.fortitude) {
      // Instantaneous (0 AP) absolute Fortitude: the API only takes it declared so or forced (workspace spec 079)
      onCreate(entry, { maneuver: { skillId: FORTITUDE_SKILL_ID, maneuverType: 'absolute' } });
    } else if (entry.purpose) {
      // A combat talent maneuver rolls its talent's skill: declared at once (workspace spec 076)
      const { skillId, specialization } = COMBAT_TALENT_PURPOSE_SKILLS[entry.purpose];
      onCreate(entry, {
        maneuver: { skillId, maneuverType: 'absolute', ...(specialization ? { specialization } : {}) },
      });
    } else if (entry.type === 'maneuver') onManeuver({ entry, skillId: null });
    else if (WEAPON_ENTRIES.includes(entry.type)) onWeapon(entry);
    // Workspace spec 079, A5: a declared `other` picks its subtype of Table 8-1 first
    else if (entry.type === 'other' && !entry.freeAction) onWeapon(entry);
    else if (SPELL_ENTRIES.includes(entry.type)) onSpell(entry);
    else if (entry.type === 'medical' || entry.type === USE_ITEM) onHeal(entry);
    else if (SKILL_MANEUVERS[entry.type]) onManeuver({ entry: maneuverEntry, skillId: SKILL_MANEUVERS[entry.type]! });
    else onCreate(entry);
  };

  const onFilterKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      const first = visible.flatMap((g) => g.entries).find((entry) => !entry.unavailable);
      if (first) choose(first);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      listRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
    }
  };

  return (
    <Box>
      <Box sx={{ p: 1.5, pb: 0.5 }}>
        <SectionLabel>{t('declare-action-for', { actor: actorRound.actorName, phase })}</SectionLabel>
        {fear && <FearNotice actorRound={actorRound} fear={fear} onDropped={onClosePalette} />}
        {/* The keys of the search box (Enter, arrow down) bubble up to this box. */}
        <Box onKeyDown={onFilterKeyDown}>
          <SearchField autoFocus size="small" value={filter} onChange={setFilter} delay={0} />
        </Box>
      </Box>
      <MenuList ref={listRef} dense aria-label={t('declare-action')} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
        {visible.map((group) => [
          <ListSubheader key={`group-${group.key}`} sx={{ lineHeight: '32px', bgcolor: 'background.paper' }}>
            {group.label}
          </ListSubheader>,
          ...group.entries.map((entry) => {
            const info = actionTypeInfo(entry.type);
            return (
              <MenuItem
                key={entry.key}
                disabled={!!entry.unavailable || busy}
                onClick={() => choose(entry)}
                // The reason of an unavailable entry must stay readable.
                sx={{ '&.Mui-disabled': { opacity: 0.65 } }}
              >
                <ListItemIcon sx={(theme) => ({ color: combatColors(theme)[info.category] })}>
                  {info.icon()}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <span>{entry.label}</span>
                      {entry.profile && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {entry.profile}
                        </Typography>
                      )}
                    </Stack>
                  }
                  secondary={
                    entry.unavailable ? (
                      t(entry.unavailable)
                    ) : (entry.warnings && entry.warnings.length > 0) || (entry.details ?? []).length > 0 ? (
                      <>
                        {(entry.details ?? []).map((line) => (
                          <Box key={line} component="span" sx={{ display: 'block', whiteSpace: 'normal' }}>
                            {line}
                          </Box>
                        ))}
                        {entry.warnings && entry.warnings.length > 0 && (
                          <Box component="span" sx={{ color: 'warning.main', display: 'block' }}>
                            {entry.warnings.join(' · ')}
                          </Box>
                        )}
                      </>
                    ) : undefined
                  }
                />
              </MenuItem>
            );
          }),
        ])}
        {visible.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary={t('no-results')} />
          </MenuItem>
        )}
      </MenuList>
    </Box>
  );
};

/**
 * What the fear of the actor lets it declare (workspace spec 068, decision 14), and the "Drop items" of a broken actor:
 * what it holds in its hands falls (0 AP) and stays in its inventory.
 */
const FearNotice: FC<{ actorRound: ActorRound; fear: string; onDropped: () => void }> = ({
  actorRound,
  fear,
  onDropped,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { updateActorRound } = useContext(CombatContext)!;
  const [dropping, setDropping] = useState(false);
  const held = (actorRound.items ?? []).some((item) => !!item.slot && !item.dropped);

  const drop = () => {
    setDropping(true);
    dropActorRoundItems(actorRound.id, auth)
      .then((updated) => {
        updateActorRound(updated);
        notify.success(t('drop-items-done'));
        onDropped();
      })
      .catch((err) => notify.error(err))
      .finally(() => setDropping(false));
  };

  return (
    <Alert
      severity="warning"
      variant="outlined"
      sx={{ mb: 1 }}
      action={
        fear === 'fear-broken' ? (
          <Button color="inherit" size="small" startIcon={<BackHandIcon />} onClick={drop} disabled={dropping || !held}>
            {t('drop-items')}
          </Button>
        ) : undefined
      }
    >
      {t(`palette-fear-${fear}`)}
    </Alert>
  );
};

export default ActionPalette;
