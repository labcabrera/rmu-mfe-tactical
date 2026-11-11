/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import GridViewIcon from '@mui/icons-material/GridView';
import { Button, Divider, Stack, Typography } from '@mui/material';
import {
  addTacticalGameFaction,
  addTacticalGameNpcs,
  CancelButton,
  Character,
  deleteTacticalGame,
  deleteTacticalGameFaction,
  DetailPage,
  EntityImage,
  Faction,
  fetchCharacters,
  fetchFactions,
  fetchFullPage,
  fetchStrategicGame,
  fetchTacticalGame,
  NpcEntry,
  renameEnvironmentFaction,
  startRound,
  TacticalGame,
  updateTacticalGame,
  useApiNotify,
  useCampaignNpcs,
  useEntity,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { addGameCharacters, deleteGameActors } from '../../api/tactical-game-roster';
import { defaultTacticalGameImage } from '../../services/image-service';
import PlayButton from '../../shared/buttons/PlayButton';
import { canManageTactical } from '../../shared/permissions';
import { FinishGameButton } from '../outcome/GameLifecycleButtons';
import GameOutcomePanel from '../outcome/GameOutcomePanel';
import TacticalGameRoster from './TacticalGameRoster';
import TacticalGameSides from './TacticalGameSides';
import TacticalGameViewEnvironment from './TacticalGameViewEnvironment';
import { RosterPending } from './roster-npcs';
import { FactionNpcSpecimen, specimenEntry } from './roster-npcs';

const NO_FACTIONS: Faction[] = [];
const NO_CHARACTERS: Character[] = [];

const TacticalGameViewPage: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId?: string }>();
  // The NPC errors of the roster (`err-npc-realm`, `err-game-not-created`...) are shown by their translated code.
  const notify = useApiNotify();
  const state = useEntity<TacticalGame>(gameId, (id) => fetchTacticalGame(id, auth), {
    initial: location.state?.tacticalGame,
    onError: notify.error,
  });
  const { entity: tacticalGame, setEntity: setTacticalGame } = state;
  // Only keyed by the strategic game: a change of the tactical game (`save`) must not reload the factions or characters.
  const strategicGameId = tacticalGame?.strategicGameId;
  const strategicGameQuery = useQuery({
    queryKey: ['tactical-game-view', 'strategic-game', strategicGameId],
    queryFn: () => fetchStrategicGame(strategicGameId as string, auth),
    enabled: !!strategicGameId,
    gcTime: 0,
  });
  const strategicGame = strategicGameQuery.data;
  const factionsQuery = useQuery<Faction[], Error>({
    queryKey: ['tactical-game-view', 'factions', strategicGameId],
    queryFn: () =>
      fetchFullPage((rsql, page, size) => fetchFactions(rsql, page, size, auth), `gameId==${strategicGameId}`).then(
        (response) => response.content
      ),
    enabled: !!strategicGameId,
    gcTime: 0,
  });
  const factions = factionsQuery.data ?? NO_FACTIONS;
  const factionIds = factions.map((faction) => faction.id).join(',');
  const charactersQuery = useQuery<Character[], Error>({
    queryKey: ['tactical-game-view', 'characters', factionIds],
    queryFn: () =>
      fetchFullPage(
        (rsql, page, size) => fetchCharacters(rsql, page, size, auth),
        `faction.id=in=(${factionIds})`
      ).then((response) => response.content),
    enabled: factionIds !== '',
    gcTime: 0,
  });
  const characters = charactersQuery.data ?? NO_CHARACTERS;
  const [pending, setPending] = useState<RosterPending>(null);
  const npcs = useCampaignNpcs(strategicGame?.realmId);

  const updateImage = (imageUrl: string) => {
    if (!gameId || !imageUrl) return;
    updateTacticalGame(gameId, { imageUrl }, auth)
      .then((response) => setTacticalGame(response))
      .catch(notify.error);
  };

  const onDelete = (game: TacticalGame) =>
    deleteTacticalGame(game.id, auth)
      .then(() => navigate('/tactical/games'))
      .catch(notify.error);

  const onPlay = (game: TacticalGame) => {
    if (game.status === 'created') {
      startRound(game.id, auth)
        .then((data) => navigate(`/tactical/combat/${data.id}`, { state: { tacticalGame: data } }))
        .catch(notify.error);
    } else {
      navigate(`/tactical/combat/${game.id}`, { state: { tacticalGame: game } });
    }
  };

  const isFactionSelected = (factionId: string) => tacticalGame?.factions.includes(factionId) || false;

  const isActorSelected = (characterId: string) =>
    tacticalGame?.actors.some((actor) => actor.id === characterId) || false;

  // One change at a time: every change writes the same game, so parallel calls would clash on its version.
  const save = (key: string, call: (game: TacticalGame) => Promise<TacticalGame>) => {
    if (!tacticalGame || pending) return;
    setPending(key);
    call(tacticalGame)
      .then((updatedGame) => setTacticalGame(updatedGame))
      .catch(notify.error)
      .finally(() => setPending(null));
  };

  const toggleFaction = (faction: Faction) =>
    save(faction.id, (game) =>
      (isFactionSelected(faction.id) ? deleteTacticalGameFaction : addTacticalGameFaction)(game.id, faction.id, auth)
    );

  const toggleActor = (character: Character) =>
    save(character.id, (game) =>
      isActorSelected(character.id)
        ? deleteGameActors(game.id, [character.id], auth)
        : addGameCharacters(game.id, [character.id], auth)
    );

  const selectGroup = (faction: Faction, group: Character[], specimens: FactionNpcSpecimen[], selected: boolean) => {
    if (group.length + specimens.length < 1) return;
    const ids = group.map((character) => character.id);
    save(`group:${faction.id}`, async (game) => {
      if (!selected) {
        const actorIds = specimens.flatMap((specimen) => (specimen.actorId ? [specimen.actorId] : []));
        return deleteGameActors(game.id, [...ids, ...actorIds], auth);
      }
      if (specimens.length < 1) return addGameCharacters(game.id, ids, auth);
      if (ids.length > 0) setTacticalGame(await addGameCharacters(game.id, ids, auth));
      return addTacticalGameNpcs(
        game.id,
        specimens.map(specimenEntry).map(({ npcId, count, name }) => ({ npcId, factionId: faction.id, count, name })),
        auth
      );
    });
  };

  const addNpcs = (factionId: string, entries: NpcEntry[]) =>
    save(`npcs:${factionId}`, (game) =>
      addTacticalGameNpcs(
        game.id,
        entries.map(({ npcId, count, name }) => ({ npcId, factionId, count, name })),
        auth
      )
    );

  const removeActor = (actorId: string) => save(actorId, (game) => deleteGameActors(game.id, [actorId], auth));

  const renameEnvironment = (name: string) =>
    save('npcs:environment', (game) => renameEnvironmentFaction(game.id, name, auth));

  useEffect(() => {
    if (strategicGameQuery.error) notify.error(strategicGameQuery.error);
  }, [strategicGameQuery.error]);
  useEffect(() => {
    if (factionsQuery.error) notify.error(factionsQuery.error);
  }, [factionsQuery.error]);
  useEffect(() => {
    if (charactersQuery.error) notify.error(charactersQuery.error);
  }, [charactersQuery.error]);

  return (
    <DetailPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('tactical-module'), link: '/tactical' },
        { name: t('tactical-games'), link: '/tactical/games' },
        { name: t('view') },
      ]}
      entity={state}
      summaryTitle={(entity) => t(entity.name)}
      actions={(game) => [
        <CancelButton onClick={() => navigate('/tactical/games')} />,
        game.status === 'finished' ? (
          <Button
            startIcon={<GridViewIcon />}
            onClick={() => navigate(`/tactical/combat/${game.id}`, { state: { tacticalGame: game } })}
          >
            {t('view-combat')}
          </Button>
        ) : (
          <PlayButton onClick={() => onPlay(game)} />
        ),
        ...(canManageTactical(game) ? [<FinishGameButton game={game} onFinished={setTacticalGame} />] : []),
      ]}
      onEdit={
        tacticalGame && canManageTactical(tacticalGame)
          ? (game) => navigate(`/tactical/games/edit/${game.id}`, { state: { tacticalGame: game } })
          : undefined
      }
      onDelete={tacticalGame && canManageTactical(tacticalGame) ? onDelete : undefined}
      leftPanel={(game) => (
        <Stack spacing={2}>
          <EntityImage
            image={game.imageUrl || defaultTacticalGameImage}
            onImageChange={canManageTactical(game) ? (imageUrl) => updateImage(imageUrl) : undefined}
          />
          <Stack spacing={1}>
            <Typography variant="h6">{game.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {strategicGame?.name || t('loading')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {game.round < 1 ? t('not-started') : `${t('round')} ${game.round}`}
            </Typography>
            <TacticalGameViewEnvironment tacticalGame={game} onChange={setTacticalGame} />
          </Stack>
          <Divider />
        </Stack>
      )}
    >
      {(game) => (
        <Stack spacing={3}>
          {canManageTactical(game) && <GameOutcomePanel game={game} onApplied={setTacticalGame} />}
          <TacticalGameRoster
            game={game}
            factions={factions}
            characters={characters}
            pending={pending}
            isFactionSelected={isFactionSelected}
            isCharacterSelected={isActorSelected}
            onToggleFaction={toggleFaction}
            onToggleCharacter={toggleActor}
            onSelectGroup={selectGroup}
            npcs={npcs}
            onAddNpcs={addNpcs}
            onRemoveActor={removeActor}
            onRenameEnvironment={renameEnvironment}
            sides={
              <TacticalGameSides game={game} factions={factions} busy={pending !== null} onChange={setTacticalGame} />
            }
          />
        </Stack>
      )}
    </DetailPage>
  );
};

export default TacticalGameViewPage;
