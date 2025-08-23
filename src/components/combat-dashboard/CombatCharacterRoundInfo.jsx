import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import GenericBar from '../shared/GenericBar';
import { CombatContext } from './CombatProvider';

const CombatCharacterRoundInfo = ({ actorRound }) => {
  const { characters, setCharacters } = useContext(CombatContext);
  const [character, setCharacter] = useState(null);

  const barSize = 220;
  const green = '#4caf50';
  const red = '#f44336';
  const blue = '#4180d3';
  const brown = '#a6a271';
  const gray = '#686868';

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(`CombatCharacterRoundInfo.useEffect triggered`, actorRound, characters);
    if (actorRound && characters && characters.length > 0) {
      const foundCharacter = characters.find((c) => c.id === actorRound.actorId);
      setCharacter(foundCharacter);
    }
  }, [actorRound, characters]);

  const handleEditCharacterClick = () => {
    navigate(`/tactical/characters/edit/${character.id}`);
  };

  if (!character) {
    return (
      <>
        <p>CombatCharacterRoundInfo Loading...</p>
      </>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={handleEditCharacterClick}>
            <Avatar alt={character.name} variant="square" src={`/static/images/races/${character.info.race}.jpg`} />
          </IconButton>
          <Stack>
            <Typography variant="content1" component="div">
              {actorRound.name}
            </Typography>
            <Typography variant="subtitle2" component="div">
              {t(character.info.race)} level {character.experience.level}
            </Typography>
          </Stack>
        </Stack>
        <GenericBar current={character.hp.current} max={character.hp.max} title="HP" width={barSize} colorOk={green} />
        {character.power && character.power.max > 0 ? (
          <GenericBar current={character.power.current} max={character.power.max} title="Power" width={barSize} colorOk={blue} colorKo={gray} />
        ) : null}
        <GenericBar current={character.endurance.current} max={character.endurance.max} title="Endurance" width={barSize} colorOk={brown} />
        <GenericBar
          current={character.endurance.accumulator}
          max={100}
          title="Fatigue"
          width={barSize}
          colorOk={brown}
          colorKo={brown}
          backgroundColor={gray}
        />
      </CardContent>
    </Card>
  );
};

export default CombatCharacterRoundInfo;
