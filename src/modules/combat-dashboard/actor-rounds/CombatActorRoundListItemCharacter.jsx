/* eslint-disable react/prop-types */
import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CombatContext } from '../../../CombatContext';
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
const CombatActorRoundListItemCharacter = ({ actorRound }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { characters } = useContext(CombatContext);
  const { factions } = useContext(CombatContext);
  const [character, setCharacter] = useState(null);
  const [faction, setFaction] = useState(null);

  const handleCharacterClick = () => {
    navigate(`/strategic/characters/view/${character.id}`);
  };

  const bindCharacterAndFaction = () => {
    const check = characters.find((c) => c.id === actorRound.actorId);
    setCharacter(check);
    setFaction(factions.find((f) => f.id === check.factionId));
  };

  useEffect(() => {
    console.log('CombatActorRoundListItemCharacter: actorRound changed', actorRound, characters, factions);
    if (actorRound && characters && factions) {
      bindCharacterAndFaction();
    }
  }, [actorRound, characters, factions]);

  if (!character) {
    return <p>CombatCharacterRoundInfo Loading...</p>;
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={handleCharacterClick}>
            <CharacterAvatar character={character} variant="square" />
          </IconButton>
          <Stack>
            <Typography variant="content1" component="div">
              {character.name}
            </Typography>
            <Typography variant="subtitle2" component="div">
              {t(character.info.raceId)} - {t(character.info.professionId)} - lvl {character.experience.level}
            </Typography>
            <Typography variant="subtitle2" component="div">
              {faction?.name}
            </Typography>
          </Stack>
        </Stack>
        <GenericBar current={character.hp.current} max={character.hp.max} title="HP" width={barSize} colorOk={colorHpOk} />
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
          current={character.endurance.current}
          max={character.endurance.max}
          title="Endurance"
          width={barSize}
          colorOk={colorKo}
          colorKo={colorEnduranceOk}
        />
        <GenericBar
          current={character.endurance.accumulator}
          max={100}
          title="Fatigue"
          width={barSize}
          colorOk={colorKo}
          colorKo={colorEnduranceAccumulator}
        />
      </CardContent>
    </Card>
  );
};

export default CombatActorRoundListItemCharacter;
