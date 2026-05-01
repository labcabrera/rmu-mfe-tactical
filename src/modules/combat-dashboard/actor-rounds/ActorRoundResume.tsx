import React, { useContext, useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Card, CardMedia, CardContent, Box } from '@mui/material';
import { Character } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { imageBaseUrl } from '../../services/config';
import { deadFilter } from '../../services/display';
import GenericBar from '../../shared/generic/GenericBar';

const barSize = 96;
const colorHpOk = '#253a4bff';
const colorPowerOk = '#4180d3';
const colorEnduranceOk = '#433a21ff';
const colorEnduranceAccumulator = '#686868';
const colorKo = '#2e140aff';

const ActorRoundResume: FC<{
  actorRound: ActorRound;
  onActorRoundView: (actorRound: ActorRound) => void;
}> = ({ actorRound, onActorRoundView }) => {
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

  if (!character) return <p>CombatCharacterRoundInfo Loading...</p>;
  const bgUrl = `${imageBaseUrl.replace(/\/?$/, '/')}images/backgrounds/bg-03.png`;

  return (
    <Card
      onClick={() => onActorRoundView(actorRound)}
      sx={{
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
      <CardContent sx={{ width: '100%', p: 2, display: 'flex', alignItems: 'flex-start' }}>
        <CardMedia
          component="img"
          image={actorRound.imageUrl || `${imageBaseUrl}images/races/unknown.png`}
          sx={{
            width: barSize,
            height: barSize,
            objectFit: 'cover',
            borderRadius: 1,
            mr: 2,
            filter: isDead ? deadFilter : undefined,
          }}
        />

        <Box sx={{ flex: 1, color: 'white' }}>
          <Typography variant="body1" color={isDead ? 'error' : 'primary'} noWrap sx={{ fontWeight: 600 }}>
            {character.name}
          </Typography>
          <Typography variant="body2" color="secondary" noWrap sx={{ fontWeight: 600 }}>
            {`${t(character.info.professionId)} lvl ${character.experience.level}`}
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
            {/* {character.power && character.power.max > 0 && (
              <GenericBar
                current={character.power.current}
                max={character.power.max}
                width={barSize}
                colorOk={colorPowerOk}
                colorKo={colorEnduranceAccumulator}
              />
            )} */}
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
