import React, { useContext, useState, useEffect, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import type { Character } from '../../api/characters';
import type { Faction } from '../../api/factions';
import CharacterAvatar from '../../shared/avatars/CharacterAvatar';
import GenericBar from '../../shared/generic/GenericBar';

const barSize = 220;
const colorHpOk = '#144214ff';
const colorPowerOk = '#4180d3';
const colorEnduranceOk = '#433a21ff';
const colorEnduranceAccumulator = '#686868';
const colorKo = '#2e140aff';

/**
 * Component that displays general information about the actor, such as their name, health bar, etc.
 */
const CombatActorRoundListItemCharacter: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const navigate = useNavigate();
  const { characters, factions } = useContext(CombatContext)!;
  const [character, setCharacter] = useState<Character | null>(null);
  const [faction, setFaction] = useState<Faction | null>(null);

  const idDead = (): boolean => {
    return actorRound.effects.some((e) => e.status === 'dead');
  };

  const handleCharacterClick = () => {
    if (character) {
      navigate(`/strategic/characters/view/${character.id}`);
    }
  };

  useEffect(() => {
    if (actorRound && characters && factions) {
      const check = characters.find((c: Character) => c.id === actorRound.actorId) || null;
      setCharacter(check);
      setFaction(check ? factions.find((f: Faction) => f.id === check.factionId) || null : null);
    }
  }, [actorRound, characters, factions]);

  if (!character) return <p>CombatCharacterRoundInfo Loading...</p>;

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={handleCharacterClick}>
            <CharacterAvatar character={character} dead={idDead()} variant="square" />
          </IconButton>
          <Stack>
            <Typography variant="body1" component="div">
              {character.name}
            </Typography>
            <Typography variant="subtitle2" component="div">
              {character.info.raceName} - {t(character.info.professionId)} - lvl {character.experience.level}
            </Typography>
            <Typography variant="subtitle2" component="div">
              {faction?.name}
            </Typography>
          </Stack>
        </Stack>
        <GenericBar
          current={actorRound.hp.current}
          max={actorRound.hp.max}
          title="HP"
          width={barSize}
          colorOk={colorHpOk}
        />
        {character.power && character.power.max > 0 ? (
          <GenericBar
            current={character.power.current}
            max={character.power.max}
            title="Power"
            width={barSize}
            colorOk={colorPowerOk}
            colorKo={colorEnduranceAccumulator}
          />
        ) : null}
        <GenericBar
          current={Math.round(actorRound.fatigue.accumulator)}
          max={100}
          title="FA"
          width={barSize}
          colorOk={colorKo}
          colorKo={colorEnduranceOk}
        />
      </CardContent>
    </Card>
  );
};

export default CombatActorRoundListItemCharacter;
