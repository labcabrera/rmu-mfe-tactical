/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CasinoIcon from '@mui/icons-material/Casino';
import GridViewIcon from '@mui/icons-material/GridView';
import GroupsIcon from '@mui/icons-material/Groups';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  addActor,
  addTacticalGameFaction,
  CancelButton,
  Character,
  deleteActor,
  deleteTacticalGame,
  deleteTacticalGameFaction,
  DetailPage,
  EditableAvatar,
  Faction,
  fetchCharacters,
  fetchFactions,
  fetchStrategicGame,
  fetchTacticalGame,
  resolveAssetUrl,
  startRound,
  StrategicGame,
  TacticalGame,
  updateTacticalGame,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { defaultFactionImage, defaultTacticalGameImage } from '../../services/image-service';
import PlayButton from '../../shared/buttons/PlayButton';
import GameOutcomePanel from '../outcome/GameOutcomePanel';
import { FinishGameButton } from '../outcome/GameLifecycleButtons';
import TacticalGameViewEnvironment from './TacticalGameViewEnvironment';

const TacticalGameViewPage: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId?: string }>();
  const notify = useNotify();
  const state = useEntity<TacticalGame>(gameId, (id) => fetchTacticalGame(id, auth), {
    initial: location.state?.tacticalGame,
    onError: notify.error,
  });
  const { entity: tacticalGame, setEntity: setTacticalGame } = state;
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);

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

  // A finished game is read-only (spec 013): factions and characters can no longer change.
  const finished = tacticalGame?.status === 'finished';

  const isFactionSelected = (factionId: string) => tacticalGame?.factions.includes(factionId) || false;

  const toggleFaction = (faction: Faction) => {
    if (!tacticalGame || finished) return;
    const action = isFactionSelected(faction.id) ? deleteTacticalGameFaction : addTacticalGameFaction;
    action(tacticalGame.id, faction.id, auth)
      .then((updatedGame) => setTacticalGame(updatedGame))
      .catch(notify.error);
  };

  const isActorSelected = (characterId: string) => {
    return (
      tacticalGame?.actors.some((actor: { id?: string; actorId?: string }) => {
        return actor.id === characterId || actor.actorId === characterId;
      }) || false
    );
  };

  const toggleActor = (character: Character) => {
    if (!tacticalGame || finished) return;
    const action = isActorSelected(character.id)
      ? deleteActor(tacticalGame.id, character.id, auth)
      : addActor(tacticalGame.id, character.id, 'character', auth);
    action.then((updatedGame) => setTacticalGame(updatedGame)).catch(notify.error);
  };

  useEffect(() => {
    if (factions && factions.length > 0) {
      const rsql = `faction.id=in=(${factions.map((faction) => faction.id).join(',')})`;
      fetchCharacters(rsql, 0, 100, auth)
        .then((response) => setCharacters(response.content))
        .catch(notify.error);
    }
  }, [factions]);

  useEffect(() => {
    if (tacticalGame) {
      fetchStrategicGame(tacticalGame.strategicGameId, auth)
        .then((data) => setStrategicGame(data))
        .catch(notify.error);
      fetchFactions(`gameId==${tacticalGame.strategicGameId}`, 0, 100, auth)
        .then((response) => setFactions(response.content))
        .catch(notify.error);
    }
  }, [tacticalGame]);

  const selectedFactions = useMemo(() => {
    return factions.filter((faction) => isFactionSelected(faction.id));
  }, [factions, tacticalGame]);

  const selectedCharacters = useMemo(() => {
    return characters.filter((character) => isActorSelected(character.id));
  }, [characters, tacticalGame]);

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
          <Box>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h5">{t('select-factions-and-characters')}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <SelectionMetric icon={<GroupsIcon />} value={selectedFactions.length} label={t('selected-factions')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <SelectionMetric
                  icon={<PersonIcon />}
                  value={selectedCharacters.length}
                  label={t('selected-characters')}
                />
              </Grid>
            </Grid>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('factions')}
            </Typography>
            <Grid container spacing={2}>
              {factions.map((faction) => {
                const factionCharacters = characters.filter((character) => character.faction.id === faction.id);
                return (
                  <Grid key={faction.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <FactionSelectionCard
                      faction={faction}
                      characterCount={factionCharacters.length}
                      selected={isFactionSelected(faction.id)}
                      disabled={factionCharacters.length < 1}
                      readOnly={finished}
                      onClick={() => toggleFaction(faction)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
          <Stack spacing={3}>
            {selectedFactions.length < 1 ? (
              <Typography variant="body2" color="text.secondary">
                {t('select-at-least-one-faction')}
              </Typography>
            ) : (
              selectedFactions.map((faction) => {
                const factionCharacters = characters.filter((character) => character.faction.id === faction.id);
                return (
                  <Box key={faction.id}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {faction.name}
                    </Typography>
                    {factionCharacters.length < 1 ? (
                      <Typography variant="body2" color="text.secondary">
                        {t('no-characters-available-for-faction')}
                      </Typography>
                    ) : (
                      <Grid container spacing={2}>
                        {factionCharacters.map((character) => (
                          <Grid key={character.id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                            <CharacterSelectionCard
                              character={character}
                              disabled={finished}
                              selected={isActorSelected(character.id)}
                              onClick={() => toggleActor(character)}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                );
              })
            )}
          </Stack>
        </Stack>
      )}
    </DetailPage>
  );
};

function SelectionMetric({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{
        alignItems: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.25,
        minHeight: 64,
      }}
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

function FactionSelectionCard({
  faction,
  characterCount,
  selected,
  disabled,
  readOnly = false,
  onClick,
}: {
  faction: Faction;
  characterCount: number;
  selected: boolean;
  disabled: boolean;
  readOnly?: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        opacity: disabled ? 0.45 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        boxShadow: selected ? 3 : 0,
        position: 'relative',
      }}
    >
      <CardActionArea disabled={disabled || readOnly} onClick={onClick}>
        <CardMedia
          component="img"
          image={resolveAssetUrl(faction.imageUrl) || defaultFactionImage}
          alt={faction.name}
          sx={{ aspectRatio: '16 / 9', objectFit: 'cover', filter: disabled ? 'grayscale(1)' : undefined }}
        />
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1">{faction.name}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {faction.shortDescription || t('faction')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {characterCount} {t('characters')}
          </Typography>
        </CardContent>
      </CardActionArea>
      {disabled && (
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <LockIcon fontSize="small" />
        </Box>
      )}
    </Card>
  );
}

function CharacterSelectionCard({
  character,
  selected,
  disabled = false,
  onClick,
}: {
  character: Character;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        boxShadow: selected ? 3 : 0,
        position: 'relative',
      }}
    >
      <CardActionArea onClick={onClick} disabled={disabled}>
        <CardMedia
          component="img"
          image={resolveAssetUrl(character.imageUrl) || defaultTacticalGameImage}
          alt={character.name}
          sx={{ aspectRatio: '4 / 3', objectFit: 'cover' }}
        />
        <CardContent>
          <Typography variant="subtitle2" noWrap>
            {character.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {character.faction.name} - {t(character.info.professionId)} - {character.experience.availableLevel}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
            <IconStat icon={<CasinoIcon fontSize="inherit" />} value={character.initiative.totalBonus} />
            <IconStat icon={<ShieldIcon fontSize="inherit" />} value={character.defense.defensiveBonus} />
            <IconStat icon={<HeartBrokenIcon fontSize="inherit" />} value={character.hp.current} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function IconStat({ icon, value }: { icon: ReactNode; value: number }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      {icon}
      <Typography variant="caption">{value}</Typography>
    </Stack>
  );
}

export default TacticalGameViewPage;
