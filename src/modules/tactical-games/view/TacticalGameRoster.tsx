import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CasinoIcon from '@mui/icons-material/Casino';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ShieldIcon from '@mui/icons-material/Shield';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, SxProps, Theme } from '@mui/material/styles';
import {
  Character,
  CharacterPicker,
  characterOption,
  entityImage,
  Faction,
  Npc,
  NpcEntry,
  TacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import TacticalGameRosterNpcs from './TacticalGameRosterNpcs';

/** Width of a faction cell. */
const ROSTER_CELL = { xs: 12, sm: 6, md: 4, xl: 3 };

/**
 * Key of the element whose change is being saved: a faction id, a character or actor id, `group:<factionId>` or
 * `npcs:<factionId>`.
 */
export type RosterPending = string | null;

type RosterProps = {
  game: TacticalGame;
  factions: Faction[];
  characters: Character[];
  pending: RosterPending;
  isFactionSelected: (factionId: string) => boolean;
  isCharacterSelected: (characterId: string) => boolean;
  onToggleFaction: (faction: Faction) => void;
  onToggleCharacter: (character: Character) => void;
  onSelectGroup: (faction: Faction, characters: Character[], selected: boolean) => void;
  /** NPCs of the campaign's realm and the generic realms (spec 055). */
  npcs: Npc[] | undefined;
  onAddNpcs: (factionId: string, entries: NpcEntry[]) => void;
  onRemoveActor: (actorId: string) => void;
  onRenameEnvironment: (name: string) => void;
};

/** Why a character cannot join the game, as the API decides it (spec 013): dead or permanently unconscious. */
function notAbleReason(character: Character): string | undefined {
  const open = (character.conditions || []).filter((condition) => !condition.resolvedAt);
  if (character.status === 'dead' || open.some((condition) => condition.status === 'dead')) return 'dead';
  if (open.some((condition) => condition.status === 'permanent-unconscious')) return 'condition-permanent-unconscious';
  return undefined;
}

/**
 * Selection of the factions and characters of a tactical game (spec 027). What can change depends on the status:
 * everything while `created`, only additions while `in_progress` (the API refuses removals) and nothing once `finished`.
 */
export default function TacticalGameRoster({
  game,
  factions,
  characters,
  pending,
  isFactionSelected,
  isCharacterSelected,
  onToggleFaction,
  onToggleCharacter,
  onSelectGroup,
  npcs,
  onAddNpcs,
  onRemoveActor,
  onRenameEnvironment,
}: RosterProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'selected'>('all');
  const finished = game.status === 'finished';
  const canRemove = game.status === 'created';
  const onlySelected = finished || filter === 'selected';
  const busy = pending !== null;

  const charactersOf = (faction: Faction) => characters.filter((character) => character.faction.id === faction.id);
  // The characters that count: those that can join, plus any already in the game.
  const eligibleOf = (faction: Faction) =>
    charactersOf(faction).filter((character) => isCharacterSelected(character.id) || !notAbleReason(character));
  const selectedFactions = factions.filter((faction) => isFactionSelected(faction.id));
  const visibleFactions = finished ? selectedFactions : factions;
  const selectableCharacters = selectedFactions.flatMap(eligibleOf);
  const selectedCount = selectableCharacters.filter((character) => isCharacterSelected(character.id)).length;
  const lockedHint = canRemove ? undefined : t('roster-locked-in-progress');

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {t('select-factions-and-characters')}
        </Typography>
        <SelectionMetric
          icon={<GroupsIcon />}
          value={`${selectedFactions.length} / ${factions.length}`}
          label={t('selected-factions')}
        />
        <SelectionMetric
          icon={<PersonIcon />}
          value={`${selectedCount} / ${selectableCharacters.length}`}
          label={t('selected-characters')}
        />
      </Stack>

      <Box>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          {t('factions')}
        </Typography>
        <Grid container spacing={1.5}>
          {visibleFactions.map((faction) => {
            const factionCharacters = eligibleOf(faction);
            const selected = isFactionSelected(faction.id);
            // A faction with NPCs (spec 055) can join without characters.
            const empty = factionCharacters.length < 1 && !faction.npcs?.length;
            const locked = selected && !canRemove;
            const selectedInFaction = factionCharacters.filter((c) => isCharacterSelected(c.id)).length;
            return (
              <Grid key={faction.id} size={ROSTER_CELL}>
                <FactionRow
                  faction={faction}
                  count={
                    selected ? `${selectedInFaction} / ${factionCharacters.length}` : `${factionCharacters.length}`
                  }
                  selected={selected}
                  disabled={finished || locked || busy || (empty && !selected)}
                  dimmed={empty && !selected}
                  pending={pending === faction.id}
                  hint={empty && !selected ? t('faction-without-characters') : locked ? lockedHint : undefined}
                  onClick={() => onToggleFaction(faction)}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('characters')}
          </Typography>
          {!finished && (
            <ToggleButtonGroup
              size="small"
              exclusive
              sx={{
                '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
              value={filter}
              onChange={(_, value) => value && setFilter(value)}
            >
              <ToggleButton value="all">{t('roster-show-all')}</ToggleButton>
              <ToggleButton value="selected">{t('roster-show-selected')}</ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>
        {selectedFactions.length < 1 ? (
          <Typography variant="body2" color="text.secondary">
            {t('select-at-least-one-faction')}
          </Typography>
        ) : (
          <Stack spacing={3}>
            {selectedFactions.map((faction) => {
              const factionCharacters = charactersOf(faction);
              const eligible = eligibleOf(faction);
              const selectedIds = eligible.filter((c) => isCharacterSelected(c.id));
              const shown = onlySelected ? selectedIds : factionCharacters;
              return (
                <Box key={faction.id}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <Avatar
                      src={entityImage('faction', faction.imageUrl)}
                      alt={faction.name}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {faction.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {`${selectedIds.length} / ${eligible.length}`}
                    </Typography>
                    {pending === `group:${faction.id}` && <CircularProgress size={18} />}
                    {!finished && (
                      <>
                        <Button
                          size="small"
                          disabled={busy || selectedIds.length === eligible.length}
                          onClick={() =>
                            onSelectGroup(
                              faction,
                              eligible.filter((c) => !isCharacterSelected(c.id)),
                              true
                            )
                          }
                        >
                          {t('select-all')}
                        </Button>
                        {canRemove && (
                          <Button
                            size="small"
                            disabled={busy || selectedIds.length === 0}
                            onClick={() => onSelectGroup(faction, selectedIds, false)}
                          >
                            {t('select-none')}
                          </Button>
                        )}
                      </>
                    )}
                  </Stack>
                  {shown.length < 1 ? (
                    <Typography variant="body2" color="text.secondary">
                      {factionCharacters.length < 1
                        ? t('no-characters-available-for-faction')
                        : t('no-selected-characters')}
                    </Typography>
                  ) : (
                    <CharacterPicker
                      mode="multiple"
                      variant="cards"
                      options={shown.map((character) => {
                        const selected = isCharacterSelected(character.id);
                        const unavailable = selected ? undefined : notAbleReason(character);
                        return characterOption(character, {
                          secondary: `${t(character.info.professionId)} · ${t('level')} ${character.experience.availableLevel}`,
                          disabledReason: unavailable && t(unavailable),
                          disabledHint: selected && !canRemove && !finished ? lockedHint : undefined,
                        });
                      })}
                      value={shown.filter((character) => isCharacterSelected(character.id)).map((c) => c.id)}
                      onChange={(ids) => {
                        const toggled = shown.find(
                          (character) => ids.includes(character.id) !== isCharacterSelected(character.id)
                        );
                        if (toggled) onToggleCharacter(toggled);
                      }}
                      renderDetails={(option) => {
                        const character = shown.find((each) => each.id === option.id);
                        return character && <CharacterStats character={character} />;
                      }}
                      pendingIds={pending ? [pending] : []}
                      disabled={finished || busy}
                    />
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <TacticalGameRosterNpcs
        game={game}
        factions={selectedFactions}
        npcs={npcs}
        pending={pending}
        onAddNpcs={onAddNpcs}
        onRemoveActor={onRemoveActor}
        onRenameEnvironment={onRenameEnvironment}
      />
    </Stack>
  );
}

function SelectionMetric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{ alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1, minWidth: 180 }}
    >
      {icon}
      <Box>
        <Typography variant="h6" sx={{ lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Stack>
  );
}

/** Check over the corner: filled when selected, empty when not, a spinner while saving. */
function SelectionMark({ selected, pending }: { selected: boolean; pending: boolean }) {
  if (pending) return <CircularProgress size={20} />;
  return selected ? (
    <CheckCircleIcon color="primary" sx={{ bgcolor: 'background.paper', borderRadius: '50%' }} />
  ) : (
    <RadioButtonUncheckedIcon sx={{ color: 'text.disabled' }} />
  );
}

const selectableSx = (selected: boolean): SxProps<Theme> => ({
  height: '100%',
  border: 2,
  borderColor: selected ? 'primary.main' : 'divider',
  bgcolor: (theme) => (selected ? alpha(theme.palette.primary.main, 0.12) : theme.palette.background.paper),
  transition: 'border-color 120ms, background-color 120ms',
});

/** Image of an element: in colour when selected, faded when not. */
const imageSx = (selected: boolean): SxProps<Theme> => ({
  filter: selected ? 'none' : 'grayscale(0.85)',
  opacity: selected ? 1 : 0.5,
  transition: 'opacity 120ms, filter 120ms',
});

function FactionRow({
  faction,
  count,
  selected,
  disabled,
  dimmed,
  pending,
  hint,
  onClick,
}: {
  faction: Faction;
  count: string;
  selected: boolean;
  disabled: boolean;
  dimmed: boolean;
  pending: boolean;
  hint?: string;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const card = (
    <Card variant="outlined" sx={{ ...selectableSx(selected), opacity: dimmed ? 0.5 : 1 }}>
      <CardActionArea
        role="checkbox"
        aria-checked={selected}
        disabled={disabled}
        onClick={onClick}
        sx={{ height: '100%' }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 1 }}>
          <Avatar
            variant="rounded"
            src={entityImage('faction', faction.imageUrl)}
            alt={faction.name}
            sx={{ width: 40, height: 40, ...imageSx(selected) }}
          />
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap color={selected ? 'text.primary' : 'text.secondary'}>
              {faction.name}
            </Typography>
            <Tooltip title={t('characters')}>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: 'center', color: 'text.secondary', width: 'fit-content' }}
              >
                <PersonIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">{count}</Typography>
              </Stack>
            </Tooltip>
          </Box>
          {dimmed ? (
            <LockIcon fontSize="small" sx={{ color: 'text.disabled' }} />
          ) : (
            <SelectionMark selected={selected} pending={pending} />
          )}
        </Stack>
      </CardActionArea>
    </Card>
  );
  return hint ? (
    <Tooltip title={hint}>
      <Box sx={{ height: '100%' }}>{card}</Box>
    </Tooltip>
  ) : (
    card
  );
}

/** Initiative, DB and hit points of a character, on the right of its card. */
function CharacterStats({ character }: { character: Character }) {
  const { t } = useTranslation();
  return (
    <Stack spacing={0.5} sx={{ alignSelf: 'center' }}>
      <IconStat
        icon={<CasinoIcon fontSize="inherit" />}
        value={character.initiative.totalBonus}
        label={t('initiative')}
      />
      <IconStat
        icon={<ShieldIcon fontSize="inherit" />}
        value={character.defense.defensiveBonus}
        label={t('defensive-bonus')}
      />
      <IconStat icon={<HeartBrokenIcon fontSize="inherit" />} value={character.hp.current} label={t('hit-points')} />
    </Stack>
  );
}

function IconStat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <Tooltip title={label}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
        {icon}
        <Typography variant="caption">{value}</Typography>
      </Stack>
    </Tooltip>
  );
}
