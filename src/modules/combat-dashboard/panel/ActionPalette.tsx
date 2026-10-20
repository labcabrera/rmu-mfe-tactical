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
  TextField,
  Typography,
} from '@mui/material';
import { combatActionInfo, CombatActionType, combatColors, usePhone } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { createAction } from '../../api/action';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';
import ManeuverDeclareDialog from './ManeuverDeclareDialog';

type PaletteEntry = {
  key: string;
  type: CombatActionType;
  label: string;
  freeAction?: boolean;
  /** Translation key of the reason why it cannot be declared now. */
  unavailable?: string;
};

type PaletteGroup = { key: string; label: string; entries: PaletteEntry[] };

/** Action types the tactical API cannot create yet (spec 005, phase 8). */
const NOT_SUPPORTED: CombatActionType[] = ['cast_spell', 'cast_instant'];

/** Palette entries declared as a maneuver with a fixed skill (the API resolves them as maneuvers). */
const SKILL_MANEUVERS: Partial<Record<CombatActionType, string>> = { perception: 'perception', medical: 'medicine' };

/** Entries of the palette for an actor in a phase, with the reason of the ones that are not available. */
const usePaletteGroups = (actorRound: ActorRound, phase: number): PaletteGroup[] => {
  const { t } = useTranslation();
  const { roundActions } = useContext(CombatContext)!;
  const actions = roundActions ?? [];
  const own = actions.filter((a) => a.actorId === actorRound.actorId);
  // A movement is declared only once per phase: none of the actor's movements may cover it (one not finished
  // yet covers up to the current phase, as in the API).
  const moving = own.some(
    (a) => a.actionType === 'movement' && a.phaseStart <= phase && phase <= (a.phaseEnd ?? phase)
  );
  // One attack at a time, melee or ranged: not while another one is still unresolved.
  const attacking = own.some(
    (a) => (a.actionType === 'melee_attack' || a.actionType === 'ranged_attack') && a.status !== 'completed'
  );

  // §8.3 Surprise: a flatfooted actor declares nothing this round, and a surprised one loses its first phases (the
  // effect's value, 2 by default). The reasons reuse the messages of the API errors.
  const flatfooted = actorRound.effects?.some((e) => e.status === 'flatfooted');
  const surprise = actorRound.effects?.find((e) => e.status === 'surprised');
  const surprisedPhase = !!surprise && phase <= (surprise.value ?? 2);
  const roundReason = flatfooted ? 'err-action-flatfooted' : surprisedPhase ? 'err-action-surprised-phase' : undefined;

  const entry = (type: CombatActionType, extra: Partial<PaletteEntry> = {}): PaletteEntry => ({
    key: extra.key ?? type,
    type,
    label: extra.label ?? t(combatActionInfo(type).labelKey),
    ...extra,
    unavailable: NOT_SUPPORTED.includes(type) ? 'coming-soon' : (roundReason ?? extra.unavailable),
  });

  const melee = actorRound.attacks.some((a) => a.type === 'melee');
  const ranged = actorRound.attacks.some((a) => a.type === 'ranged');
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
        entry('melee_attack', {
          unavailable: attacking ? 'already-attacking' : !melee ? 'no-melee-attacks' : undefined,
        }),
        entry('ranged_attack', {
          unavailable: attacking ? 'already-attacking' : !ranged ? 'no-ranged-attacks' : undefined,
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
    { key: 'magic', label: t('magic'), entries: [entry('cast_spell'), entry('cast_instant')] },
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
  const { create, busy } = useCreateAction(actorRound, phase, (action) => {
    setManeuver(null);
    onCreated(action);
  });
  const close = () => {
    setManeuver(null);
    onClose();
  };
  // The palette hides while the maneuver dialog is open.
  const open = Boolean(actorRound) && !maneuver;
  const content = actorRound && (
    <PaletteContent
      actorRound={actorRound}
      phase={phase}
      busy={busy}
      onClose={close}
      onCreate={create}
      onManeuver={setManeuver}
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
  if (isPhone) {
    return (
      <>
        <Drawer anchor="bottom" open={open} onClose={close} slotProps={{ paper: { sx: { maxHeight: '85dvh' } } }}>
          {content}
        </Drawer>
        {dialog}
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
}> = ({ actorRound, phase, busy, onClose, onCreate, onManeuver }) => {
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
                <ListItemText primary={entry.label} secondary={entry.unavailable ? t(entry.unavailable) : undefined} />
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
