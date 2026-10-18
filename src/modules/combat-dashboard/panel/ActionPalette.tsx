import React, { FC, KeyboardEvent, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Drawer,
  IconButton,
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
import {
  combatActionInfo,
  CombatActionType,
  combatColors,
  useNotify,
  usePhone,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { createAction } from '../../api/action';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { isPhaseTaken } from '../../services/action-service';
import SelectManeuverType from '../../shared/selects/SelectManeuverType';
import SelectSkillByCategory from '../../shared/selects/SelectSkillByCategory';

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
  const pending = actions.filter((a) => a.actorId === actorRound.actorId && a.status !== 'completed');
  const phaseTaken = isPhaseTaken(actorRound.actorId, phase, actions);
  const moving = pending.some((a) => a.actionType === 'movement');
  const attacking = pending.some((a) => a.actionType === 'melee_attack' && !a.freeAction);

  const entry = (type: CombatActionType, extra: Partial<PaletteEntry> = {}): PaletteEntry => ({
    key: extra.key ?? type,
    type,
    label: extra.label ?? t(combatActionInfo(type).labelKey),
    ...extra,
    unavailable: NOT_SUPPORTED.includes(type) ? 'coming-soon' : extra.unavailable,
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
        entry('stand_up', { unavailable: phaseTaken ? 'phase-taken' : undefined }),
      ],
    },
    {
      key: 'combat',
      label: t('combat'),
      entries: [
        entry('melee_attack', {
          unavailable: phaseTaken
            ? 'phase-taken'
            : attacking
              ? 'already-attacking'
              : !melee
                ? 'no-melee-attacks'
                : undefined,
        }),
        entry('ranged_attack', {
          unavailable: phaseTaken ? 'phase-taken' : !ranged ? 'no-ranged-attacks' : undefined,
        }),
        entry('dodge', { unavailable: phaseTaken ? 'phase-taken' : undefined }),
        entry('draw_and_load', { unavailable: phaseTaken ? 'phase-taken' : undefined }),
      ],
    },
    {
      key: 'maneuvers',
      label: t('maneuvers'),
      entries: [
        entry('maneuver', { unavailable: phaseTaken ? 'phase-taken' : undefined }),
        entry('perception', { unavailable: phaseTaken ? 'phase-taken' : undefined }),
        entry('medical', { unavailable: phaseTaken ? 'phase-taken' : undefined }),
      ],
    },
    { key: 'magic', label: t('magic'), entries: [entry('cast_spell'), entry('cast_instant')] },
    { key: 'other', label: t('other'), entries: [entry('other')] },
  ];
};

/**
 * Action palette of an actor: the action types grouped, filterable by typing (Enter picks the first match),
 * with the reason of the ones that cannot be declared now. Choosing one creates the action; maneuvers first
 * ask for the skill and the maneuver type in the same view. A popover, or a bottom sheet on phones.
 */
const ActionPalette: FC<{
  actorRound: ActorRound | null;
  phase: number;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onCreated: (action: Action) => void;
}> = ({ actorRound, phase, anchorEl, onClose, onCreated }) => {
  const isPhone = usePhone();
  const open = Boolean(actorRound);
  const content = actorRound && (
    <PaletteContent actorRound={actorRound} phase={phase} onClose={onClose} onCreated={onCreated} />
  );
  if (isPhone) {
    return (
      <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: { maxHeight: '85dvh' } } }}>
        {content}
      </Drawer>
    );
  }
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      // Opened from the keyboard there is no button to anchor to: show it at the top center.
      anchorReference={anchorEl ? 'anchorEl' : 'anchorPosition'}
      anchorPosition={{ top: 120, left: typeof window === 'undefined' ? 0 : window.innerWidth / 2 }}
      transformOrigin={anchorEl ? undefined : { vertical: 'top', horizontal: 'center' }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{ paper: { sx: { width: 340, maxHeight: '70vh' } } }}
    >
      {content}
    </Popover>
  );
};

const PaletteContent: FC<{
  actorRound: ActorRound;
  phase: number;
  onClose: () => void;
  onCreated: (action: Action) => void;
}> = ({ actorRound, phase, onClose, onCreated }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const { game, roundActions, setRoundActions } = useContext(CombatContext)!;
  const groups = usePaletteGroups(actorRound, phase);
  const [filter, setFilter] = useState('');
  const [maneuver, setManeuver] = useState<{ skillId: string | null; maneuverType: string } | null>(null);
  const [busy, setBusy] = useState(false);
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

  const create = (entry: PaletteEntry, extra: Record<string, unknown> = {}) => {
    if (!game || busy) return;
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

  const choose = (entry: PaletteEntry) => {
    if (entry.unavailable) return;
    if (entry.type === 'maneuver') setManeuver({ skillId: null, maneuverType: 'absolute' });
    else if (SKILL_MANEUVERS[entry.type])
      setManeuver({ skillId: SKILL_MANEUVERS[entry.type]!, maneuverType: 'absolute' });
    else create(entry);
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

  if (maneuver) {
    // Perception and medical are maneuvers with their skill already chosen.
    const entry = groups.flatMap((g) => g.entries).find((e) => e.type === 'maneuver')!;
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton aria-label={t('back')} onClick={() => setManeuver(null)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {entry.label}
          </Typography>
        </Stack>
        <Box>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
            {t('maneuver-type')}
          </Typography>
          <SelectManeuverType
            value={maneuver.maneuverType}
            onChange={(maneuverType) => setManeuver({ ...maneuver, maneuverType })}
          />
        </Box>
        <SelectSkillByCategory
          value={maneuver.skillId ?? undefined}
          onChange={(skillId) => setManeuver({ ...maneuver, skillId })}
        />
        <Button
          variant="contained"
          disabled={!maneuver.skillId || busy}
          onClick={() => create(entry, { maneuver })}
          sx={{ alignSelf: 'flex-end' }}
        >
          {t('declare')}
        </Button>
      </Stack>
    );
  }

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
