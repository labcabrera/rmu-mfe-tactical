import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import TacticalActionCreationActions from '../../combat-actions/ActionCreationActions';
import AttackDeclarationAttributes from './AttackDeclarationAttributes';

const AttackDeclaration = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isValid, setIsValid] = useState(false);
  const phaseStart = searchParams.get('phaseStart');
  const game = location.state?.game;
  const character = location.state?.character;
  const characters = location.state?.characters;

  const [formData, setFormData] = useState({
    gameId: game.id,
    actorId: character.id,
    actionType: 'attack',
    phaseStart: phaseStart,
    actionPoints: 4,
    attacks: [
      {
        attackName: 'mainHand',
        targetId: '',
        parry: 0,
      },
    ],
  });

  useEffect(() => {
    var isValidForm = false;
    if (formData.attacks[0] && formData.attacks[0].targetId) {
      isValidForm = true;
    }

    setIsValid(isValidForm);
  }, [formData]);

  if (!game || !character || !characters) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <TacticalActionCreationActions game={game} character={character} formData={formData} isValid={isValid} />
      <div className="generic-main-content">
        <Grid container spacing={2}>
          <Grid item size={6}>
            <AttackDeclarationAttributes formData={formData} setFormData={setFormData} character={character} characters={characters} />
          </Grid>
        </Grid>
        <div>
          <h2>formData</h2>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
          <h2>character</h2>
          <pre>{JSON.stringify(character, null, 2)}</pre>
          <h2>characters</h2>
          <pre>{JSON.stringify(characters, null, 2)}</pre>
        </div>
      </div>
    </>
  );
};

export default AttackDeclaration;
