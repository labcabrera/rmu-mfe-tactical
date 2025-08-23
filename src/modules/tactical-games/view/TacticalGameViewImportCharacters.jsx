import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import AddButton from '../../../components/button/AddButton';

const TacticalGameViewImportCharacters = ({ tacticalGame }) => {
  const debugMode = false;

  const navigate = useNavigate();
  const [tacticalCharacters, setTacticalCharacters] = useState([]);

  const removeCharacter = (id) => {
    setTacticalCharacters(tacticalCharacters.filter((item) => item.id !== id));
  };

  useEffect(() => {}, []);

  const handleAddNewCharacter = () => {
    navigate('/tactical/characters/creation', { state: { tacticalGame: tacticalGame } });
  };

  if (!tacticalCharacters || tacticalCharacters.length === 0) {
    return <p>No characters found.</p>;
  }

  return (
    <>
      {/* <List sx={{ width: '100%' }}>
        {tacticalCharacters.map((item, index) => (
          <TacticalGameViewCharactersListItem key={index} character={item} tacticalGame={tacticalGame} onRemoveCharacter={removeCharacter} />
        ))}
      </List> */}
      <Stack
        spacing={0}
        direction="row"
        sx={{
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          marginLeft: '8px',
        }}
      >
        <AddButton onClick={handleAddNewCharacter} />
      </Stack>
    </>
  );
};

export default TacticalGameViewImportCharacters;
