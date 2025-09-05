/* eslint-disable react/prop-types */
import React, { useContext, useState } from 'react';
import Grid from '@mui/material/Grid';
import { CombatContext } from '../../../../CombatContext';
import ResolveActionDialogMovementStepper from './ResolveMovementStepper';

const ResolveMovement = ({ action, character }) => {
  const { game, strategicGame } = useContext(CombatContext);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    phase: parseInt(game.phase.replace('phase_', '')),
    pace: '',
    requiredManeuver: false,
    difficulty: character.equipment.movementBaseDifficulty || '',
    skillId: 'running',
    roll: '',
  });

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <ResolveActionDialogMovementStepper
          formData={formData}
          setFormData={setFormData}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          strategicGame={strategicGame}
          game={game}
          character={character}
          action={action}
        />
      </Grid>
      <Grid size={12}></Grid>
      <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
      <Grid size={12}></Grid>
      <pre>Action: {JSON.stringify(action, null, 2)}</pre>
    </Grid>
  );
};

export default ResolveMovement;
