/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState, ReactNode, Dispatch, SetStateAction, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  Character,
  ENVIRONMENT_FACTION_ID,
  environmentFactionName,
  Faction,
  fetchAllPages,
  fetchCharacters,
  fetchFactions,
  fetchNpcs,
  fetchStrategicGame,
  fetchTacticalGame,
  Npc,
  StrategicGame,
  TacticalGame,
  TechnicalInfo,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { Query, QueryClient, QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchActionsByGameAndRound } from '../api/action';
import { Action } from '../api/action.dto';
import { fetchActorRounds } from '../api/actor-rounds';
import { ActorRound } from '../api/actor-rounds.dto';
import {
  CombatActionsContext,
  CombatActionsValue,
  CombatGameContext,
  CombatGameValue,
  CombatRoundContext,
  CombatRoundValue,
  RoundActorSort,
} from './combat-context';

// Debug panel with the raw combat state, enabled with localStorage.setItem('rmu-debug', 'true').
const isDebugEnabled = (): boolean => {
  try {
    return localStorage.getItem('rmu-debug') === 'true';
  } catch {
    return false;
  }
};

/** A cached value through the setter the consumers have always used. */
const writeCache = <T,>(client: QueryClient, key: QueryKey, action: SetStateAction<T | null>) =>
  client.setQueryData<T | null>(key, (previous) =>
    typeof action === 'function' ? (action as (value: T | null) => T | null)(previous ?? null) : action
  );

export const CombatProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const client = useQueryClient();

  const [gameId, setGameId] = useState<string | null>(null);
  const [displayRound, setDisplayRound] = useState<number | null>(null);
  const [roundActorSort, setRoundActorSort] = useState<RoundActorSort>('name');

  // Workspace spec 091: the data of a combat lives while the board is open (`gcTime: 0`), so entering again loads it anew.
  const live = { gcTime: 0 };
  const { scope, gameKey, roundScope, actorRoundsKey, actionsKey } = useMemo(() => {
    const combatScope = ['combat', gameId] as const;
    const round = [...combatScope, 'round', displayRound];
    return {
      scope: combatScope,
      gameKey: [...combatScope, 'game'],
      roundScope: round,
      actorRoundsKey: [...round, 'actor-rounds'],
      actionsKey: [...round, 'actions'],
    };
  }, [gameId, displayRound]);
  // Going through the rounds keeps the previous one on screen until the new one arrives, within the same game.
  const sameGame = <T,>(previous: T | undefined, query: Query<T, Error, T, QueryKey> | undefined) =>
    query?.queryKey[1] === gameId ? previous : undefined;

  const gameQuery = useQuery({
    ...live,
    queryKey: gameKey,
    queryFn: () => fetchTacticalGame(gameId as string, auth) as Promise<TacticalGame>,
    enabled: gameId !== null,
  });
  const game = gameQuery.data ?? null;

  const actorRoundsQuery = useQuery<ActorRound[], Error>({
    ...live,
    queryKey: actorRoundsKey,
    queryFn: () => fetchActorRounds(gameId as string, displayRound as number, auth).then((data) => data.content),
    enabled: game !== null && displayRound !== null,
    placeholderData: sameGame,
  });
  const actionsQuery = useQuery<Action[], Error>({
    ...live,
    queryKey: actionsKey,
    queryFn: () => fetchActionsByGameAndRound(gameId as string, displayRound as number, auth),
    enabled: game !== null && displayRound !== null,
    placeholderData: sameGame,
  });

  // The actors decide what else is loaded, so a change of the roster loads what is new.
  const characterIds = (game?.actors ?? []).filter((actor) => actor.type !== 'npc').map((actor) => actor.id);
  const npcIds = [...new Set((game?.actors ?? []).map((actor) => actor.npcId).filter((id): id is string => !!id))];
  const factionIds = (game?.factions ?? []).filter((id) => id !== ENVIRONMENT_FACTION_ID);

  const characterIdList = characterIds.join(',');
  const charactersKey = useMemo(() => [...scope, 'characters', characterIdList], [scope, characterIdList]);
  const charactersQuery = useQuery<Character[], Error>({
    ...live,
    queryKey: charactersKey,
    queryFn: () =>
      characterIds.length === 0
        ? Promise.resolve([])
        : fetchAllPages(
            (rsql, page, size) => fetchCharacters(rsql, page, size, auth),
            `id=in=(${characterIds.join(',')})`
          ),
    enabled: game !== null,
  });
  const npcsQuery = useQuery<Npc[], Error>({
    ...live,
    queryKey: [...scope, 'npcs', npcIds.join(',')],
    queryFn: () =>
      npcIds.length === 0
        ? Promise.resolve([])
        : fetchAllPages((rsql, page, size) => fetchNpcs(rsql, page, size, auth), `id=in=(${npcIds.join(',')})`),
    enabled: game !== null,
  });
  const factionsQuery = useQuery<Faction[], Error>({
    ...live,
    queryKey: [...scope, 'factions', factionIds.join(',')],
    queryFn: () =>
      factionIds.length === 0
        ? Promise.resolve([])
        : fetchAllPages((rsql, page, size) => fetchFactions(rsql, page, size, auth), `id=in=(${factionIds.join(',')})`),
    enabled: game !== null,
  });
  const strategicGameQuery = useQuery({
    ...live,
    queryKey: [...scope, 'strategic-game', game?.strategicGameId],
    queryFn: () => fetchStrategicGame(game!.strategicGameId, auth) as Promise<StrategicGame>,
    enabled: game !== null,
  });

  const strategicGame = strategicGameQuery.data ?? null;
  const characters = charactersQuery.data ?? null;
  const npcs = npcsQuery.data ?? null;
  const roundActions = actionsQuery.data ?? null;

  // The environment (spec 055) is not a strategic faction: it is added here, so the board treats it as any other.
  const factions = useMemo<Faction[] | null>(() => {
    if (!game || !factionsQuery.data) return null;
    const environment: Faction[] = game.factions.includes(ENVIRONMENT_FACTION_ID)
      ? [
          {
            id: ENVIRONMENT_FACTION_ID,
            gameId: game.strategicGameId,
            name: environmentFactionName(game.environmentFaction?.name, t),
            management: { availableGold: 0 },
          },
        ]
      : [];
    return [...factionsQuery.data, ...environment];
  }, [factionsQuery.data, game?.factions, game?.environmentFaction?.name, game?.strategicGameId, t]);

  // Sorting is done in memory and refetches nothing.
  const actorRounds = useMemo<ActorRound[] | null>(() => {
    if (!actorRoundsQuery.data) return null;
    const sorted = [...actorRoundsQuery.data];
    if (roundActorSort === 'name') {
      sorted.sort((a, b) => a.actorName.localeCompare(b.actorName));
    } else {
      sorted.sort((a, b) => (b.initiative?.total ?? 0) - (a.initiative?.total ?? 0));
    }
    return sorted;
  }, [actorRoundsQuery.data, roundActorSort]);

  /** What keeps the board from showing anything; a failure of anything else is only notified. */
  const loadError =
    (!gameQuery.data && gameQuery.error) ||
    (gameQuery.data && !actorRoundsQuery.data && actorRoundsQuery.error) ||
    (gameQuery.data && !actionsQuery.data && actionsQuery.error) ||
    null;

  const queries = [
    gameQuery,
    actorRoundsQuery,
    actionsQuery,
    charactersQuery,
    npcsQuery,
    factionsQuery,
    strategicGameQuery,
  ];
  useEffect(
    () => {
      queries.forEach((query) => {
        if (query.error && query.error !== loadError) notify.error(query.error);
      });
    },
    queries.map((query) => query.error)
  );

  // Workspace spec 091: the setters and refreshers only change with the keys, so a change of the data re-renders
  // nobody through them; each one works on the keys of the render that created it, as a consumer always saw.
  const actions = useMemo<CombatActionsValue>(() => {
    // A game that changes can change its rounds and actions too.
    const setGame: Dispatch<SetStateAction<TacticalGame | null>> = (action) => {
      writeCache(client, gameKey, action);
      client.invalidateQueries({ queryKey: [...scope, 'round'] });
    };
    const setActorRounds: Dispatch<SetStateAction<ActorRound[] | null>> = (action) =>
      writeCache(client, actorRoundsKey, action);
    const setRoundActions: Dispatch<SetStateAction<Action[] | null>> = (action) =>
      writeCache(client, actionsKey, action);
    const setCharacters: Dispatch<SetStateAction<Character[] | null>> = (action) =>
      writeCache(client, charactersKey, action);

    const refreshActorRounds = () => {
      client.invalidateQueries({ queryKey: actorRoundsKey });
    };

    const refreshRound = () => {
      client.invalidateQueries({ queryKey: roundScope });
    };

    const reloadCombat = () => {
      client.invalidateQueries({ queryKey: scope });
    };

    const updateAction = (updatedAction: Action) => {
      setRoundActions((prevActions) =>
        prevActions
          ? prevActions.map((action) => (action.id === updatedAction.id ? updatedAction : action))
          : prevActions
      );
    };

    const updateActorRound = (updatedActorRound: ActorRound) => {
      setActorRounds((prevRounds) =>
        prevRounds
          ? prevRounds.map((round) => (round.id === updatedActorRound.id ? updatedActorRound : round))
          : prevRounds
      );
    };

    return {
      setGameId,
      setGame,
      setActorRounds,
      setCharacters,
      setRoundActions,
      setDisplayRound,
      setRoundActorSort,
      updateAction,
      updateActorRound,
      refreshActorRounds,
      refreshRound,
      reloadCombat,
    };
  }, [client, scope, gameKey, roundScope, actorRoundsKey, actionsKey, charactersKey]);

  // A game starts on its current round; the order of these two effects matters when the data is already there.
  useEffect(() => {
    setDisplayRound(null);
  }, [gameId]);

  useEffect(() => {
    if (game) {
      setDisplayRound(game.round);
    }
  }, [game?.id]);

  const gameValue = useMemo<CombatGameValue>(
    () => ({ gameId, strategicGame, game, characters, factions, npcs, loadError }),
    [gameId, strategicGame, game, characters, factions, npcs, loadError]
  );
  const roundValue = useMemo<CombatRoundValue>(
    () => ({ actorRounds, roundActions, displayRound, roundActorSort }),
    [actorRounds, roundActions, displayRound, roundActorSort]
  );

  return (
    <>
      <CombatGameContext.Provider value={gameValue}>
        <CombatRoundContext.Provider value={roundValue}>
          <CombatActionsContext.Provider value={actions}>{children}</CombatActionsContext.Provider>
        </CombatRoundContext.Provider>
      </CombatGameContext.Provider>

      {isDebugEnabled() && (
        <TechnicalInfo>
          {JSON.stringify(
            { tacticalGame: game, actorRounds, characters, roundActions, strategicGame, displayRound },
            null,
            2
          )}
        </TechnicalInfo>
      )}
    </>
  );
};
