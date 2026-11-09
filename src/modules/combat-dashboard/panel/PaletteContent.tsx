import { FC, KeyboardEvent, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  MenuList,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  combatColors,
  FALL_CONTROL_SKILL,
  FORTITUDE_SKILL_ID,
  SearchField,
  SectionLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../api/actor-rounds.dto';
import { COMBAT_TALENT_PURPOSE_SKILLS } from '../../services/combat-talents-service';
import { actionTypeInfo } from '../board/action-type-info';
import { GRAPPLE_ESCAPE_SKILLS } from '../flows/maneuver/GrappleEscapeFlow';
import PaletteFearNotice from './PaletteFearNotice';
import {
  actorFearState,
  filterPaletteGroups,
  ManeuverChoice,
  PaletteEntry,
  SKILL_MANEUVERS,
  SPELL_ENTRIES,
  USE_ITEM,
  WEAPON_ENTRIES,
} from './palette-rules';
import { usePaletteGroups } from './usePaletteGroups';

const PaletteContent: FC<{
  actorRound: ActorRound;
  /** Phase the action starts in: the current one, or a past one chosen in the selector. */
  phase: number;
  currentPhase: number;
  selectablePhases: number[];
  onPhaseChange: (phase: number) => void;
  busy: boolean;
  onClose: () => void;
  onCreate: (entry: PaletteEntry, extra?: Record<string, unknown>) => void;
  onManeuver: (choice: ManeuverChoice) => void;
  onSpell: (entry: PaletteEntry) => void;
  onHeal: (entry: PaletteEntry) => void;
  onWeapon: (entry: PaletteEntry) => void;
  onClosePalette: () => void;
}> = ({
  actorRound,
  phase,
  currentPhase,
  selectablePhases,
  onPhaseChange,
  busy,
  onClose,
  onCreate,
  onManeuver,
  onSpell,
  onHeal,
  onWeapon,
  onClosePalette,
}) => {
  const { t } = useTranslation();
  const groups = usePaletteGroups(actorRound, phase, currentPhase);
  const fear = actorFearState(actorRound);
  const [filter, setFilter] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  const visible = useMemo(() => filterPaletteGroups(groups, filter), [groups, filter]);

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
        {selectablePhases.length > 0 && (
          <Stack spacing={0.5} sx={{ mb: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {t('retro-declare-from-phase')}
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={phase}
                aria-label={t('retro-declare-from-phase')}
                onChange={(_, value: number | null) => value !== null && onPhaseChange(value)}
              >
                {[...selectablePhases, currentPhase].map((each) => (
                  <ToggleButton key={each} value={each} sx={{ py: 0, px: 1.25 }}>
                    {each}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
            {phase < currentPhase && (
              <Typography variant="caption" color="warning.main">
                {t('retro-declare-help', { count: currentPhase - phase + 1 })}
              </Typography>
            )}
          </Stack>
        )}
        {fear && <PaletteFearNotice actorRound={actorRound} fear={fear} onDropped={onClosePalette} />}
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

export default PaletteContent;
