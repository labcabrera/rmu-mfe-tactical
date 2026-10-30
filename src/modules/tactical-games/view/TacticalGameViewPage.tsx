/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import GridViewIcon from '@mui/icons-material/GridView';
import { Button, Divider, Stack, Typography } from '@mui/material';
import {
  addTacticalGameFaction,
  CancelButton,
  Character,
  deleteTacticalGame,
  deleteTacticalGameFaction,
  DetailPage,
  EditableAvatar,
  Faction,
  fetchCharacters,
  fetchFactions,
  fetchStrategicGame,
  fetchTacticalGame,
  addTacticalGameNpcs,
  NpcEntry,
  renameEnvironmentFaction,
  startRound,
  StrategicGame,
  TacticalGame,
  updateTacticalGame,
  useCampaignNpcs,
  useEntity,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { addGameCharacters, deleteGameActors } from '../../api/tactical-game-roster';
import { defaultTacticalGameImage } from '../../services/image-service';
import { useTacticalNotify } from '../../services/notify-service';
import PlayButton from '../../shared/buttons/PlayButton';
import { FinishGameButton } from '../outcome/GameLifecycleButtons';
import GameOutcomePanel from '../outcome/GameOutcomePanel';
import TacticalGameRoster, { RosterPending } from './TacticalGameRoster';
import TacticalGameViewEnvironment from './TacticalGameViewEnvironment';

const TacticalGameViewPage: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId?: string }>();
  // The NPC errors of the roster (`err-npc-realm`, `err-game-not-created`...) are shown by their translated code.
  const notify = useTacticalNotify();
  const state = useEntity<TacticalGame>(gameId, (id) => fetchTacticalGame(id, auth), {
    initial: location.state?.tacticalGame,
    onError: notify.error,
  });
  const { entity: tacticalGame, setEntity: setTacticalGame } = state;
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
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

  const selectGroup = (faction: Faction, group: Character[], selected: boolean) => {
    if (group.length < 1) return;
    const ids = group.map((character) => character.id);
    save(`group:${faction.id}`, (game) =>
      selected ? addGameCharacters(game.id, ids, auth) : deleteGameActors(game.id, ids, auth)
    );
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
    if (factions && factions.length > 0) {
      const rsql = `faction.id=in=(${factions.map((faction) => faction.id).join(',')})`;
      fetchCharacters(rsql, 0, 100, auth)
        .then((response) => setCharacters(response.content))
        .catch(notify.error);
    }
  }, [factions]);

  // Only when the strategic game changes: reloading on every change of the game would reload the characters too.
  const strategicGameId = tacticalGame?.strategicGameId;
  useEffect(() => {
    if (strategicGameId) {
      fetchStrategicGame(strategicGameId, auth)
        .then((data) => setStrategicGame(data))
        .catch(notify.error);
      fetchFactions(`gameId==${strategicGameId}`, 0, 100, auth)
        .then((response) => setFactions(response.content))
        .catch(notify.error);
    }
  }, [strategicGameId]);

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
        <FinishGameButton game={game} onFinished={setTacticalGame} />,
      ]}
      onEdit={(game) => navigate(`/tactical/games/edit/${game.id}`, { state: { tacticalGame: game } })}
      onDelete={onDelete}
      leftPanel={(game) => (
        <Stack spacing={2}>
          <EditableAvatar
            imageUrl={game.imageUrl || defaultTacticalGameImage}
            onImageChange={(imageUrl) => updateImage(imageUrl)}
          />
          <Stack spacing={1}>
            <Typography variant="h6">{game.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {strategicGame?.name || t('loading')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {game.round < 1 ? t('not-started') : `${t('round')} ${game.round}`}
            </Typography>
            <TacticalGameViewEnvironment tacticalGame={game} />
          </Stack>
          <Divider />
        </Stack>
      )}
    >
      {(game) => (
        <Stack spacing={3}>
          <GameOutcomePanel game={game} onApplied={setTacticalGame} />
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
          />
        </Stack>
      )}
    </DetailPage>
  );
};

export default TacticalGameViewPage;
