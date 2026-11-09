import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import { Box, Button, Grid, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import {
  Character,
  characterOption,
  CharacterPicker,
  EmptyState,
  EntityAvatar,
  entityImage,
  Faction,
  LoadingState,
  Npc,
  NpcEntry,
  npcImage,
  TacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { canManageTactical } from '../../shared/permissions';
import { CharacterStats, FactionRow, SelectionMetric } from './TacticalGameRosterCards';
import TacticalGameRosterNpcs from './TacticalGameRosterNpcs';
import type { RosterPending } from './roster-npcs';
import { FactionNpcSpecimen, factionNpcSpecimens, specimenEntry } from './roster-npcs';
import { notAbleReason } from './roster-rules';

/** Width of a faction cell. */
const ROSTER_CELL = { xs: 12, sm: 6, md: 4, xl: 3 };

type RosterProps = {
  game: TacticalGame;
  factions: Faction[];
  characters: Character[];
  pending: RosterPending;
  isFactionSelected: (factionId: string) => boolean;
  isCharacterSelected: (characterId: string) => boolean;
  onToggleFaction: (faction: Faction) => void;
  onToggleCharacter: (character: Character) => void;
  onSelectGroup: (
    faction: Faction,
    characters: Character[],
    specimens: FactionNpcSpecimen[],
    selected: boolean
  ) => void;
  /** NPCs of the campaign's realm and the generic realms (spec 055). */
  npcs: Npc[] | undefined;
  onAddNpcs: (factionId: string, entries: NpcEntry[]) => void;
  onRemoveActor: (actorId: string) => void;
  onRenameEnvironment: (name: string) => void;
};

/**
 * Selection of the factions and characters of a tactical game (spec 027). What can change depends on the status:
 * everything while `created`, only additions while `in_progress` (the API refuses removals) and nothing once `finished`.
 * The NPCs of a faction are chosen here too, specimen by specimen, but only while `created`: the API refuses more.
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
  // Spec 072: only the masters change the roster; the others read it as a finished game.
  const finished = game.status === 'finished' || !canManageTactical(game);
  const canRemove = game.status === 'created' && !finished;
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
  const specimensOf = (faction: Faction) => factionNpcSpecimens(faction, game);
  const selectableSpecimens = selectedFactions.flatMap(specimensOf);
  const selectedSpecimens = selectableSpecimens.filter((specimen) => specimen.actorId).length;
  const imageOfNpc = (npcId: string) => {
    const npc = npcs?.find((each) => each.id === npcId);
    return npc ? npcImage(npc) : entityImage('npc', undefined);
  };

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
        {selectableSpecimens.length > 0 && (
          <SelectionMetric
            icon={<PetsIcon />}
            value={`${selectedSpecimens} / ${selectableSpecimens.length}`}
            label={t('selected-npcs')}
          />
        )}
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
            const specimens = specimensOf(faction);
            const selectedInFaction =
              factionCharacters.filter((c) => isCharacterSelected(c.id)).length +
              specimens.filter((specimen) => specimen.actorId).length;
            const total = factionCharacters.length + specimens.length;
            return (
              <Grid key={faction.id} size={ROSTER_CELL}>
                <FactionRow
                  faction={faction}
                  count={selected ? `${selectedInFaction} / ${total}` : `${total}`}
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
              const specimens = specimensOf(faction);
              const chosenSpecimens = specimens.filter((specimen) => specimen.actorId);
              const shownSpecimens = onlySelected ? chosenSpecimens : specimens;
              const npcsEditable = game.status === 'created' && !finished;
              const missingSpecimens = npcsEditable ? specimens.filter((specimen) => !specimen.actorId) : [];
              return (
                <Box key={faction.id}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <EntityAvatar name={faction.name} imageUrl={faction.imageUrl} kind="faction" size={32} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {faction.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {`${selectedIds.length + chosenSpecimens.length} / ${eligible.length + specimens.length}`}
                    </Typography>
                    {pending === `group:${faction.id}` && <LoadingState variant="inline" />}
                    {!finished && (
                      <>
                        <Button
                          size="small"
                          disabled={busy || (selectedIds.length === eligible.length && missingSpecimens.length === 0)}
                          onClick={() =>
                            onSelectGroup(
                              faction,
                              eligible.filter((c) => !isCharacterSelected(c.id)),
                              missingSpecimens,
                              true
                            )
                          }
                        >
                          {t('select-all')}
                        </Button>
                        {canRemove && (
                          <Button
                            size="small"
                            disabled={busy || selectedIds.length + chosenSpecimens.length === 0}
                            onClick={() => onSelectGroup(faction, selectedIds, chosenSpecimens, false)}
                          >
                            {t('select-none')}
                          </Button>
                        )}
                      </>
                    )}
                  </Stack>
                  {shown.length + shownSpecimens.length < 1 && (
                    <EmptyState
                      dense
                      title={
                        factionCharacters.length + specimens.length < 1
                          ? t('no-characters-available-for-faction')
                          : t('no-selected-characters')
                      }
                    />
                  )}
                  {shown.length > 0 && (
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
                  {shownSpecimens.length > 0 && (
                    <Box sx={{ mt: shown.length > 0 ? 1.5 : 0 }}>
                      <CharacterPicker
                        mode="multiple"
                        variant="cards"
                        options={shownSpecimens.map((specimen) => {
                          const npc = npcs?.find((each) => each.id === specimen.npcId);
                          return {
                            id: specimen.id,
                            name: specimen.name,
                            imageUrl: imageOfNpc(specimen.npcId),
                            secondary: npc ? `${t('npc')} · ${t('level')} ${npc.level}` : t('npc'),
                            disabledHint: npcsEditable || finished ? undefined : t('roster-npcs-locked-in-progress'),
                          };
                        })}
                        value={chosenSpecimens.map((specimen) => specimen.id)}
                        onChange={(ids) => {
                          const toggled = shownSpecimens.find(
                            (specimen) => ids.includes(specimen.id) !== !!specimen.actorId
                          );
                          if (!toggled) return;
                          if (toggled.actorId) onRemoveActor(toggled.actorId);
                          else onAddNpcs(faction.id, [specimenEntry(toggled)]);
                        }}
                        pendingIds={shownSpecimens.filter((each) => each.actorId === pending).map((each) => each.id)}
                        disabled={finished || busy}
                      />
                    </Box>
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
