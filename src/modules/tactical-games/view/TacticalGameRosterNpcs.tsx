import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ENVIRONMENT_FACTION_ID,
  entityImage,
  environmentFactionName,
  Faction,
  Npc,
  NpcEntry,
  NpcEntryDialog,
  npcImage,
  resolveAssetUrl,
  RmuDialog,
  TacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import type { RosterPending } from './TacticalGameRoster';

type NpcGroup = { id: string; name: string; image: string; faction?: Faction };

/**
 * The NPC actors of a tactical game by faction, the environment included (spec 055). While the game is `created`,
 * specimens can be added to a faction or to the environment (also the NPCs of the strategic faction at once),
 * removed one by one, and the environment renamed. The API refuses those changes once the game started.
 */
export default function TacticalGameRosterNpcs({
  game,
  factions,
  npcs,
  pending,
  onAddNpcs,
  onRemoveActor,
  onRenameEnvironment,
}: {
  game: TacticalGame;
  /** The strategic factions selected for the game. */
  factions: Faction[];
  npcs: Npc[] | undefined;
  pending: RosterPending;
  onAddNpcs: (factionId: string, entries: NpcEntry[]) => void;
  onRemoveActor: (actorId: string) => void;
  onRenameEnvironment: (name: string) => void;
}) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const editable = game.status === 'created';
  const busy = pending !== null;
  const npcActors = game.actors.filter((actor) => actor.type === 'npc');
  const environmentName = environmentFactionName(game.environmentFaction?.name, t);

  const groups: NpcGroup[] = [
    ...factions.map((faction) => ({
      id: faction.id,
      name: faction.name,
      image: entityImage('faction', faction.imageUrl),
      faction,
    })),
    { id: ENVIRONMENT_FACTION_ID, name: environmentName, image: entityImage('npc', undefined) },
  ];
  const shownGroups = editable ? groups : groups.filter((group) => npcActors.some((a) => a.faction.id === group.id));
  const imageOf = (npcId: string | undefined) => {
    const npc = npcId ? npcs?.find((each) => each.id === npcId) : undefined;
    return npc ? resolveAssetUrl(npcImage(npc)) : undefined;
  };

  if (shownGroups.length === 0) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        {t('npcs')}
      </Typography>
      <Stack spacing={2.5}>
        {shownGroups.map((group) => {
          const actors = npcActors.filter((actor) => actor.faction.id === group.id);
          const factionNpcs = group.faction?.npcs ?? [];
          const isEnvironment = group.id === ENVIRONMENT_FACTION_ID;
          return (
            <Box key={group.id}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
                <Avatar src={group.image} alt={group.name} sx={{ width: 32, height: 32 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, minWidth: 0 }} noWrap>
                  {group.name}
                </Typography>
                {isEnvironment && editable && (
                  <Tooltip title={t('rename-environment-faction')}>
                    <IconButton
                      size="small"
                      aria-label={t('rename-environment-faction')}
                      disabled={busy}
                      onClick={() => setRenaming(environmentName)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                  {actors.length}
                </Typography>
                {pending === `npcs:${group.id}` && <CircularProgress size={18} />}
                {editable && factionNpcs.length > 0 && (
                  <Button
                    size="small"
                    startIcon={<GroupAddIcon />}
                    disabled={busy}
                    onClick={() => onAddNpcs(group.id, factionNpcs)}
                  >
                    {t('add-faction-npcs')}
                  </Button>
                )}
                {editable && (
                  <Button size="small" startIcon={<AddIcon />} disabled={busy} onClick={() => setAdding(group.id)}>
                    {t('add-npc')}
                  </Button>
                )}
              </Stack>
              {actors.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {isEnvironment ? t('environment-npcs-empty') : t('faction-npc-actors-empty')}
                </Typography>
              ) : (
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {actors.map((actor) => (
                    <Chip
                      key={actor.id}
                      label={actor.name}
                      variant="outlined"
                      avatar={<Avatar src={imageOf(actor.npcId)} alt={actor.name} />}
                      disabled={pending === actor.id}
                      onDelete={editable && !busy ? () => onRemoveActor(actor.id) : undefined}
                      sx={{ maxWidth: '100%' }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          );
        })}
      </Stack>
      <NpcEntryDialog
        open={adding !== null}
        title={t('add-npc')}
        npcs={npcs}
        onSave={(entry) => {
          if (adding) onAddNpcs(adding, [entry]);
          setAdding(null);
        }}
        onClose={() => setAdding(null)}
      />
      <RmuDialog
        open={renaming !== null}
        title={t('rename-environment-faction')}
        maxWidth="xs"
        onCancel={() => setRenaming(null)}
        onConfirm={() => {
          if (renaming?.trim()) onRenameEnvironment(renaming.trim());
          setRenaming(null);
        }}
        onConfirmDisabled={!renaming?.trim()}
      >
        <TextField
          label={t('environment-faction-name')}
          name="environment-faction-name"
          value={renaming ?? ''}
          placeholder={environmentFactionName(undefined, t)}
          onChange={(event) => setRenaming(event.target.value)}
          fullWidth
          autoFocus
          sx={{ mt: 1 }}
        />
      </RmuDialog>
    </Box>
  );
}
