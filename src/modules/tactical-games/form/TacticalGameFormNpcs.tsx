import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  CreateTacticalGameDto,
  entityImage,
  environmentFactionName,
  Faction,
  FactionPicker,
  Npc,
  NpcEntry,
  NpcEntryDialog,
  NpcEntryList,
  npcImage,
  resolveAssetUrl,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** What a new game brings besides its data (spec 055): factions, their NPCs and the environment. */
export type GameNpcSetup = {
  factions: string[];
  includeFactionNpcs: boolean;
  /** Empty: the API's default name, shown translated. */
  environmentName: string;
  environmentNpcs: NpcEntry[];
};

export const EMPTY_NPC_SETUP: GameNpcSetup = {
  factions: [],
  includeFactionNpcs: true,
  environmentName: '',
  environmentNpcs: [],
};

/** The fields of the creation request that come from the setup. */
export const npcSetupRequest = (setup: GameNpcSetup): Partial<CreateTacticalGameDto> => ({
  factions: setup.factions,
  includeFactionNpcs: setup.includeFactionNpcs,
  ...(setup.environmentNpcs.length > 0 || setup.environmentName.trim()
    ? {
        environmentFaction: {
          ...(setup.environmentName.trim() ? { name: setup.environmentName.trim() } : {}),
          npcs: setup.environmentNpcs.map(({ npcId, count, name }) => ({ npcId, count, name })),
        },
      }
    : {}),
});

/** Names the API gives the specimens of an entry: `Wolf` for one, `Wolf 1`, `Wolf 2`… for several. */
export const specimenNames = (entry: Pick<NpcEntry, 'name' | 'count'>): string[] =>
  entry.count > 1 ? Array.from({ length: entry.count }, (_, index) => `${entry.name} ${index + 1}`) : [entry.name];

/**
 * Factions, faction NPCs and environment of a new tactical game (spec 055, decision 3), with a preview of the NPC
 * actors the game will get. Characters are still chosen in the roster once the game exists.
 */
const TacticalGameFormNpcs: FC<{
  factions: Faction[] | undefined;
  npcs: Npc[] | undefined;
  setup: GameNpcSetup;
  onChange: (setup: GameNpcSetup) => void;
}> = ({ factions, npcs, setup, onChange }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const environmentName = setup.environmentName.trim() || environmentFactionName(undefined, t);

  const saveEntry = (entry: NpcEntry) => {
    const environmentNpcs =
      editing === 'new'
        ? [...setup.environmentNpcs, entry]
        : setup.environmentNpcs.map((each, index) => (index === editing ? entry : each));
    onChange({ ...setup, environmentNpcs });
    setEditing(null);
  };

  const groups = [
    ...(setup.includeFactionNpcs
      ? (factions ?? [])
          .filter((faction) => setup.factions.includes(faction.id))
          .map((faction) => ({
            key: faction.id,
            name: faction.name,
            image: entityImage('faction', faction.imageUrl),
            entries: faction.npcs ?? [],
          }))
      : []),
    {
      key: 'environment',
      name: environmentName,
      image: entityImage('npc', undefined),
      entries: setup.environmentNpcs,
    },
  ].filter((group) => group.entries.length > 0);
  const total = groups.reduce((sum, group) => sum + group.entries.reduce((count, e) => count + e.count, 0), 0);
  const imageOf = (npcId: string) => {
    const npc = npcs?.find((each) => each.id === npcId);
    return npc ? resolveAssetUrl(npcImage(npc)) : undefined;
  };

  return (
    <Stack spacing={2.5}>
      <Divider />
      <Stack spacing={1}>
        <Typography variant="h6">{t('factions')}</Typography>
        <FactionPicker
          mode="multiple"
          factions={factions}
          value={setup.factions}
          onChange={(ids) => onChange({ ...setup, factions: ids })}
          emptyText={t('strategic-game-without-factions')}
        />
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                name="include-faction-npcs"
                checked={setup.includeFactionNpcs}
                onChange={(event) => onChange({ ...setup, includeFactionNpcs: event.target.checked })}
              />
            }
            label={t('include-faction-npcs')}
          />
          <FormHelperText sx={{ mt: 0 }}>{t('include-faction-npcs-help')}</FormHelperText>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('environment-faction')}
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => setEditing('new')}>
            {t('add-npc')}
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {t('environment-faction-help')}
        </Typography>
        <TextField
          label={t('environment-faction-name')}
          name="environment-faction-name"
          value={setup.environmentName}
          placeholder={environmentFactionName(undefined, t)}
          onChange={(event) => onChange({ ...setup, environmentName: event.target.value })}
          sx={{ maxWidth: 420 }}
        />
        <NpcEntryList
          entries={setup.environmentNpcs}
          npcs={npcs}
          emptyText={t('environment-npcs-empty')}
          onEdit={setEditing}
          onRemove={(index) =>
            onChange({ ...setup, environmentNpcs: setup.environmentNpcs.filter((_, each) => each !== index) })
          }
        />
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h6">{t('game-actors-preview')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {total > 0 ? t('game-actors-preview-npcs', { count: total }) : t('game-actors-preview-none')}{' '}
          {t('game-actors-preview-characters')}
        </Typography>
        {groups.map((group) => (
          <Box key={group.key}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
              <Avatar src={group.image} alt={group.name} sx={{ width: 24, height: 24 }} />
              <Typography variant="subtitle2">{group.name}</Typography>
            </Stack>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {group.entries.flatMap((entry, index) =>
                specimenNames(entry).map((name) => (
                  <Chip
                    key={`${index}-${name}`}
                    size="small"
                    variant="outlined"
                    label={name}
                    avatar={<Avatar src={imageOf(entry.npcId)} alt={name} />}
                  />
                ))
              )}
            </Stack>
          </Box>
        ))}
      </Stack>

      <NpcEntryDialog
        open={editing !== null}
        title={editing === 'new' ? t('add-npc') : t('edit-npc')}
        npcs={npcs}
        entry={typeof editing === 'number' ? setup.environmentNpcs[editing] : undefined}
        onSave={saveEntry}
        onClose={() => setEditing(null)}
      />
    </Stack>
  );
};

export default TacticalGameFormNpcs;
