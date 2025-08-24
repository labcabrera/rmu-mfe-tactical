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
  const actorRound = location.state?.actorRound;
  const characters = location.state?.characters;
  const character = location.state?.character;

  //TODO read attacks from character

  const [formData, setFormData] = useState({
    gameId: game.id,
    actorId: actorRound.id,
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

  if (!game || !actorRound || !characters) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <TacticalActionCreationActions game={game} character={actorRound} formData={formData} isValid={isValid} />
      <div className="generic-main-content">
        <Grid container spacing={2}>
          <Grid item size={6}>
            <AttackDeclarationAttributes formData={formData} setFormData={setFormData} character={actorRound} characters={characters} />
          </Grid>
        </Grid>
        <div>
          <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
          <pre>ActorRound: {JSON.stringify(actorRound, null, 2)}</pre>
          <pre>Character: {JSON.stringify(character, null, 2)}</pre>
          <pre>Characters: {JSON.stringify(characters, null, 2)}</pre>
        </div>
      </div>
    </>
  );
};

export default AttackDeclaration;
