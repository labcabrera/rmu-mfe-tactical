import React, { FC, KeyboardEvent, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Drawer,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  MenuList,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { combatActionInfo, CombatActionType, combatColors, usePhone } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { createAction } from '../../api/action';
import { Action, ActionType, ForceReason } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { isActorRoundFearBlocked } from '../../services/actor-round-service';
import {
  apCapacity,
  apProfileLabel,
  apRemaining,
  DECLARE_AP_PROFILES,
  isActionOpen,
  useOpenRounds,
} from '../../services/ap-service';
import { useTacticalNotify } from '../../services/notify-service';
import { actionLabel } from '../actor-rounds/action-view';
import ManeuverDeclareDialog from './ManeuverDeclareDialog';
import SpellDeclareDialog, { actorCharacter, isCaster } from './SpellDeclareDialog';

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
};

type PaletteGroup = { key: string; label: string; entries: PaletteEntry[] };

/** Palette entries declared as a maneuver with a fixed skill (the API resolves them as maneuvers). */
const SKILL_MANEUVERS: Partial<Record<CombatActionType, string>> = { perception: 'perception', medical: 'medicine' };

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
  // AP the actor can still spend this round: the open action gives back the AP of this phase when interrupted.
  const remaining = apRemaining(actorRound, phase) + (interrupted.length > 0 ? 1 : 0);

  const entry = (type: CombatActionType, extra: Partial<PaletteEntry> = {}): PaletteEntry => {
    const profile = extra.freeAction || extra.forced ? { min: 0, max: 0 } : DECLARE_AP_PROFILES[type as ActionType];
    const warnings: string[] = [];
    if (profile && profile.min > remaining)
      warnings.push(
        `${t('declare-warning-unreachable', { min: profile.min })} ${t(openRounds ? 'continues-next-round' : 'expires-at-round-end')}`
      );
    if (!extra.freeAction && !extra.forced && type !== 'movement')
      interrupted.forEach((open) =>
        warnings.push(t('declare-warning-interrupts', { action: actionLabel(open, t, actorRounds) }))
      );
    return {
      key: extra.key ?? type,
      type,
      label: extra.label ?? t(combatActionInfo(type).labelKey),
      profile: profile ? apProfileLabel(profile, t) : t('ap-profile-by-skill'),
      warnings,
      ...extra,
      // A forced attack takes no AP: only a flatfooted actor cannot make it.
      unavailable:
        (extra.forced ? (flatfooted ? 'err-action-flatfooted' : undefined) : roundReason) ?? extra.unavailable,
    };
  };

  const melee = actorRound.attacks.some((a) => a.type === 'melee');
  const ranged = actorRound.attacks.some((a) => a.type === 'ranged');
  const afraid = isActorRoundFearBlocked(actorRound) ? 'err-action-fear' : undefined;
  // Spells come from the spellbook of a strategic character (spec 030): NPCs cast none yet.
  const caster = isCaster(actorCharacter(actorRound, characters));
  const noSpells = actorRound.actorType === 'npc' ? 'npc-no-spells' : 'no-spellbook';
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
      ],
    },
    {
      key: 'maneuvers',
      label: t('maneuvers'),
      entries: [entry('maneuver'), entry('perception'), entry('medical')],
    },
    {
      key: 'magic',
      label: t('magic'),
      entries: [
        entry('cast_spell', { unavailable: caster ? undefined : noSpells }),
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
  const { game, roundActions, setRoundActions } = useContext(CombatContext)!;
  const [busy, setBusy] = useState(false);

  const create = (entry: PaletteEntry, extra: Record<string, unknown> = {}) => {
    if (!game || !actorRound || busy) return;
    setBusy(true);
    createAction(
      {
        gameId: game.id,
        actorId: actorRound.actorId,
        actionType: entry.type,
        phaseStart: phase,
        freeAction: !!entry.freeAction,
        ...(entry.forced ? { forced: { reason: entry.forced } } : {}),
        ...extra,
      },
      auth
    )
      .then((action) => {
        setRoundActions([...(roundActions ?? []), action]);
        notify.success(t('action-declared', { action: entry.label }));
        onCreated(action);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };
  return { create, busy };
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
  const { create, busy } = useCreateAction(actorRound, phase, (action) => {
    setManeuver(null);
    setSpellEntry(null);
    onCreated(action);
  });
  const close = () => {
    setManeuver(null);
    setSpellEntry(null);
    onClose();
  };
  // The palette hides while the maneuver or spell dialog is open.
  const open = Boolean(actorRound) && !maneuver && !spellEntry;
  const content = actorRound && (
    <PaletteContent
      actorRound={actorRound}
      phase={phase}
      busy={busy}
      onClose={close}
      onCreate={create}
      onManeuver={setManeuver}
      onSpell={setSpellEntry}
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
  if (isPhone) {
    return (
      <>
        <Drawer anchor="bottom" open={open} onClose={close} slotProps={{ paper: { sx: { maxHeight: '85dvh' } } }}>
          {content}
        </Drawer>
        {dialog}
        {spellDialog}
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
    </>
  );
};

const PaletteContent: FC<{
  actorRound: ActorRound;
  phase: number;
  busy: boolean;
  onClose: () => void;
  onCreate: (entry: PaletteEntry) => void;
  onManeuver: (choice: ManeuverChoice) => void;
  onSpell: (entry: PaletteEntry) => void;
}> = ({ actorRound, phase, busy, onClose, onCreate, onManeuver, onSpell }) => {
  const { t } = useTranslation();
  const groups = usePaletteGroups(actorRound, phase);
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
    if (entry.type === 'maneuver') onManeuver({ entry, skillId: null });
    else if (SPELL_ENTRIES.includes(entry.type)) onSpell(entry);
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
        <Typography variant="overline" color="text.secondary">
          {t('declare-action-for', { actor: actorRound.actorName, phase })}
        </Typography>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder={t('search')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onKeyDown={onFilterKeyDown}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <MenuList ref={listRef} dense aria-label={t('declare-action')} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
        {visible.map((group) => [
          <ListSubheader key={`group-${group.key}`} sx={{ lineHeight: '32px', bgcolor: 'background.paper' }}>
            {group.label}
          </ListSubheader>,
          ...group.entries.map((entry) => {
            const info = combatActionInfo(entry.type);
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
                    ) : entry.warnings && entry.warnings.length > 0 ? (
                      <Box component="span" sx={{ color: 'warning.main', display: 'block' }}>
                        {entry.warnings.join(' · ')}
                      </Box>
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

export default ActionPalette;
