import React, { useContext, useState, useEffect, FC } from 'react';
import { Stack, Typography } from '@mui/material';
import { RmuCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { Character } from '../../api/characters.dto';
import { imageBaseUrl } from '../../services/config';
import { deadFilter } from '../../services/display';
import GenericBar from '../../shared/generic/GenericBar';

const barSize = 96;
const colorHpOk = '#253a4bff';
const colorPowerOk = '#4180d3';
const colorEnduranceOk = '#433a21ff';
const colorEnduranceAccumulator = '#686868';
const colorKo = '#2e140aff';

/**
 * Component that displays general information about the actor, such as their name, health bar, etc.
 */
const ActorRoundResume: FC<{
  actorRound: ActorRound;
  onActorRoundView: (actorRound: ActorRound) => void;
}> = ({ actorRound, onActorRoundView }) => {
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

  return (
    <RmuCard
      image={actorRound.imageUrl || `${imageBaseUrl}images/races/unknown.png`}
      height={150}
      imageFilter={isDead ? deadFilter : undefined}
      onClick={() => onActorRoundView(actorRound)}
      contentBgImage={`${imageBaseUrl}images/backgrounds/bg-03.png`}
    >
      <Stack direction="column">
        <Typography variant="body1" color={isDead ? 'error' : 'primary'}>
          {character.name}
        </Typography>
        <Typography variant="caption" color="primary">
          {`${t(character.info.professionId)} lvl ${character.experience.level}`}
        </Typography>
        <Typography variant="caption" color="primary">
          {`${character.faction?.name || ''}`}
        </Typography>

        <GenericBar
          current={actorRound.hp.current}
          max={actorRound.hp.max}
          width={barSize}
          colorOk={colorHpOk}
          colorKo={colorKo}
        />
        {character.power && character.power.max > 0 && (
          <GenericBar
            current={character.power.current}
            max={character.power.max}
            width={barSize}
            colorOk={colorPowerOk}
            colorKo={colorEnduranceAccumulator}
          />
        )}
        <GenericBar
          current={Math.round(actorRound.fatigue.accumulator)}
          max={100}
          width={barSize}
          colorOk={colorKo}
          colorKo={colorEnduranceOk}
        />
      </Stack>
    </RmuCard>
  );
};

export default ActorRoundResume;
