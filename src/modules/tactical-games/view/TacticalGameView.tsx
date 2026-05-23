/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CasinoIcon from '@mui/icons-material/Casino';
import GroupsIcon from '@mui/icons-material/Groups';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Checkbox,
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
  DeleteButton,
  DeleteDialog,
  deleteActor,
  deleteTacticalGame,
  deleteTacticalGameFaction,
  EditableAvatar,
  EditButton,
  Faction,
  fetchCharacters,
  fetchFactions,
  fetchStrategicGame,
  fetchTacticalGame,
  LayoutBase,
  RefreshButton,
  startRound,
  StrategicGame,
  TacticalGame,
  TechnicalInfo,
  updateTacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { defaultFactionImage, defaultTacticalGameImage } from '../../services/image-service';
import PlayButton from '../../shared/buttons/PlayButton';
import TacticalGameViewEnvironment from './TacticalGameViewEnvironment';

const TacticalGameView: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId?: string }>();
  const { showError } = useError();
  const [tacticalGame, setTacticalGame] = useState<TacticalGame>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateImage = (imageUrl: string) => {
    if (!gameId || !imageUrl) return;
    const dto = { imageUrl };
    updateTacticalGame(gameId, dto, auth)
      .then((response) => setTacticalGame(response))
      .catch((err) => showError(err));
  };

  const onDelete = () => {
    deleteTacticalGame(tacticalGame!.id, auth)
      .then(() => {
        navigate('/tactical/games');
        setDeleteDialogOpen(false);
      })
      .catch((err) => showError(err.message));
  };

  const onEdit = () => {
    navigate(`/tactical/games/edit/${tacticalGame!.id}`, { state: { tacticalGame } });
  };

  const onPlay = async () => {
    if (tacticalGame!.status === 'created') {
      startRound(tacticalGame!.id, auth)
        .then((data) => navigate(`/tactical/combat/${data.id}`, { state: { tacticalGame: data } }))
        .catch((err) => showError(err.message));
    } else {
      navigate(`/tactical/combat/${tacticalGame!.id}`, { state: { tacticalGame } });
    }
  };

  const onRefresh = () => {
    fetchTacticalGame(tacticalGame!.id, auth)
      .then((response) => setTacticalGame(response))
      .catch((err) => showError(err.message));
  };

  const isFactionSelected = (factionId: string) => tacticalGame?.factions.includes(factionId) || false;

  const toggleFaction = (faction: Faction) => {
    if (!tacticalGame) return;
    const action = isFactionSelected(faction.id) ? deleteTacticalGameFaction : addTacticalGameFaction;
    action(tacticalGame.id, faction.id, auth)
      .then((updatedGame) => setTacticalGame(updatedGame))
      .catch((err) => showError(err.message));
  };

  const isActorSelected = (characterId: string) => {
    return (
      tacticalGame?.actors.some((actor: { id?: string; actorId?: string }) => {
        return actor.id === characterId || actor.actorId === characterId;
      }) || false
    );
  };

  const toggleActor = (character: Character) => {
    if (!tacticalGame) return;
    const action = isActorSelected(character.id)
      ? deleteActor(tacticalGame.id, character.id, auth)
      : addActor(tacticalGame.id, character.id, 'character', auth);
    action
      .then((updatedGame) => setTacticalGame(updatedGame))
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  useEffect(() => {
    if (factions && factions.length > 0) {
      const rsql = `faction.id=in=(${factions.map((faction) => faction.id).join(',')})`;
      fetchCharacters(rsql, 0, 100, auth)
        .then((response) => setCharacters(response.content))
        .catch((err) => showError(err.message));
    }
  }, [factions, showError]);

  useEffect(() => {
    if (tacticalGame) {
      fetchStrategicGame(tacticalGame.strategicGameId, auth)
        .then((data) => setStrategicGame(data))
        .catch((err) => showError(err.message));
      fetchFactions(`gameId==${tacticalGame.strategicGameId}`, 0, 100, auth)
        .then((response) => setFactions(response.content))
        .catch((err) => showError(err.message));
    }
  }, [auth, showError, tacticalGame]);

  useEffect(() => {
    if (location.state && location.state.realm) {
      setTacticalGame(location.state.tacticalGame);
    } else if (gameId && auth) {
      fetchTacticalGame(gameId, auth)
        .then((response) => setTacticalGame(response))
        .catch((err) => showError(err.message));
    }
  }, [location.state, gameId]);

  const selectedFactions = useMemo(() => {
    return factions.filter((faction) => isFactionSelected(faction.id));
  }, [factions, tacticalGame]);

  const selectedCharacters = useMemo(() => {
    return characters.filter((character) => isActorSelected(character.id));
  }, [characters, tacticalGame]);

  if (!tacticalGame) return <p>Loading...</p>;

  return (
    <LayoutBase
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('tactical-module'), link: '/tactical' },
        { name: t('tactical-games'), link: '/tactical/games' },
        { name: t('view') },
      ]}
      actions={[
        <CancelButton onClick={() => navigate('/tactical/games')} />,
        <PlayButton onClick={() => onPlay()} />,
        <RefreshButton onClick={() => onRefresh()} />,
        <EditButton onClick={() => onEdit()} />,
        <DeleteButton onClick={() => setDeleteDialogOpen(true)} />,
      ]}
      leftPanel={
        <Stack spacing={2}>
          <EditableAvatar
            imageUrl={tacticalGame.imageUrl || defaultTacticalGameImage}
            onImageChange={(imageUrl) => updateImage(imageUrl)}
          />
          <Stack spacing={1}>
            <Typography variant="h6">{tacticalGame.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {strategicGame?.name || t('loading')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {tacticalGame.round < 1 ? t('not_started') : `${t('round')} ${tacticalGame.round}`}
            </Typography>
            <TacticalGameViewEnvironment tacticalGame={tacticalGame} />
          </Stack>
          <Divider />
        </Stack>
      }
    >
      <Stack spacing={3}>
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
      <TechnicalInfo>
        <pre>TacticalGame: {JSON.stringify(tacticalGame, null, 2)}</pre>
      </TechnicalInfo>
      <DeleteDialog
        message={`Are you sure you want to delete ${tacticalGame.name} game? This action cannot be undone.`}
        onDelete={() => onDelete()}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </LayoutBase>
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
  onClick,
}: {
  faction: Faction;
  characterCount: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        opacity: disabled ? 0.45 : 1,
        borderColor: selected ? 'warning.main' : 'divider',
        position: 'relative',
      }}
    >
      <CardActionArea disabled={disabled} onClick={onClick}>
        <CardMedia
          component="img"
          image={faction.imageUrl || defaultFactionImage}
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
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        {disabled ? <LockIcon fontSize="small" /> : <Checkbox checked={selected} tabIndex={-1} />}
      </Box>
    </Card>
  );
}

function CharacterSelectionCard({
  character,
  selected,
  onClick,
}: {
  character: Character;
  selected: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: selected ? 'warning.main' : 'divider',
        position: 'relative',
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardMedia
          component="img"
          image={character.imageUrl || defaultTacticalGameImage}
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
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <Checkbox checked={selected} tabIndex={-1} />
      </Box>
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

export default TacticalGameView;
