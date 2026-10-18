import React, { useContext, useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Card, CardMedia, CardContent, Box } from '@mui/material';
import { Character, imageBaseUrl, resolveAssetUrl } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { deadFilter } from '../../services/image-filters';
import GenericBar from '../../shared/generic/GenericBar';

// Palette paths: hit points in blue while above half, fatigue in red once above half.
const colorHpOk = 'info.dark';
const colorEnduranceOk = 'warning.dark';
const colorKo = 'error.dark';

const ActorRoundResume: FC<{
  actorRound: ActorRound;
  onActorRoundView: (actorRound: ActorRound) => void;
  /** Phones: smaller portrait and bars. */
  compact?: boolean;
}> = ({ actorRound, onActorRoundView, compact = false }) => {
  const imageSize = compact ? 64 : 80;
  const barSize = compact ? 56 : 72;
  const { t } = useTranslation();
  const { characters, factions } = useContext(CombatContext)!;
  const [character, setCharacter] = useState<Character | null>(null);
  const isDead = actorRound.effects.some((e) => e.status === 'dead');

  useEffect(() => {
    if (actorRound && characters && factions) {
      const check = characters.find((c: Character) => c.id === actorRound.actorId) || null;
      setCharacter(check);
    }
  }, [actorRound, characters, factions]);

  if (!character) return null;
  const bgUrl = `${(imageBaseUrl ?? '').replace(/\/?$/, '/')}images/backgrounds/bg-03.png`;

  return (
    <Card
      component="button"
      type="button"
      onClick={() => onActorRoundView(actorRound)}
      aria-label={character.name}
      sx={{
        p: 0,
        border: 0,
        textAlign: 'left',
        font: 'inherit',
        color: 'inherit',
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'stretch',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      elevation={0}
    >
      <CardContent sx={{ width: '100%', minWidth: 0, p: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'flex-start' }}>
        <CardMedia
          component="img"
          image={resolveAssetUrl(actorRound.imageUrl) || `${imageBaseUrl}images/races/unknown.png`}
          sx={{
            width: imageSize,
            height: imageSize,
            flexShrink: 0,
            objectFit: 'cover',
            borderRadius: 1,
            mr: 1.5,
            filter: isDead ? deadFilter : undefined,
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" color={isDead ? 'error' : 'primary'} noWrap sx={{ fontWeight: 600 }}>
            {character.name}
          </Typography>
          <Typography variant="body2" color="secondary" noWrap sx={{ fontWeight: 600 }}>
            {t('profession-level', { profession: t(character.info.professionId), level: character.experience.level })}
          </Typography>
          <Typography variant="body2" color="secondary" noWrap sx={{ fontWeight: 600 }}>
            {`${character.faction?.name || ''}`}
          </Typography>

          <Box sx={{ mt: 1 }}>
            <GenericBar
              current={actorRound.hp.current}
              max={actorRound.hp.max}
              width={barSize}
              colorOk={colorHpOk}
              colorKo={colorKo}
            />
            <GenericBar
              current={Math.round(actorRound.fatigue.accumulator)}
              max={100}
              width={barSize}
              colorOk={colorKo}
              colorKo={colorEnduranceOk}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActorRoundResume;
