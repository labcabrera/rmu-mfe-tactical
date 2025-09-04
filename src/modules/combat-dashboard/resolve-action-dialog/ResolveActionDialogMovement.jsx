/* eslint-disable react/prop-types */
import React, { useContext, useState } from 'react';
import { Grid, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { resolveMovement } from '../../api/actions';
import SelectPace from '../../shared/selects/SelectPace';

const ResolveActionDialogMovement = ({ action, character }) => {
  const { showError } = useError();
  const { game } = useContext(CombatContext);
  const { strategicGame } = useContext(CombatContext);
  const [formData, setFormData] = useState({ pace: '' });
  const [paceMultiplier, setPaceMultiplier] = useState('');
  const [movement, setMovement] = useState('');
  const [adjustedMovement, setAdjustedMovement] = useState('');

  const handleResolve = () => {
    resolveMovement(action.id, formData)
      .then((result) => {
        //TODO
        console.log('Movement resolved:', result);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const handlePaceChange = (value, pace) => {
    setFormData({ ...formData, pace: value });
    setPaceMultiplier(pace.multiplier);
    const actionPoints = getActionPoints();
    const movement = character.movement.baseMovementRate * pace.multiplier * actionPoints;
    const scaleMultiplier = strategicGame?.options?.boardScaleMultiplier || 1;
    const adjustedMovement = movement * scaleMultiplier;
    setMovement(movement);
    setAdjustedMovement(`${adjustedMovement} (x${scaleMultiplier})`);
  };

  const getActionPoints = () => {
    //TODO check other actions in previous phases
    const startPhase = action.phaseStart;
    const currentPhase = parseInt(game.phase.replace('phase_', ''));
    return currentPhase - startPhase + 1;
  };

  return (
    <>
      <h2>Movement Resolution</h2>
      <Grid container spacing={2}>
        <Grid size={2}>
          <SelectPace value={formData.pace} onChange={handlePaceChange} />
        </Grid>
        <Grid size={2}>
          <TextField label="BMR" name="bmr" value={character.movement.baseMovementRate} variant="standard" fullWidth />
        </Grid>
        <Grid size={2}>
          <TextField label="Action points" name="actionPoints" value={getActionPoints()} variant="standard" fullWidth />
        </Grid>
        <Grid size={2}>
          <TextField label="Pace multiplier" name="paceMultiplier" value={paceMultiplier} variant="standard" fullWidth />
        </Grid>
        <Grid size={2}>
          <TextField label="Movement" name="movement" value={movement} variant="standard" fullWidth />
        </Grid>
        <Grid size={2}>
          <TextField label="Adjusted movement" name="adjustedMovement" value={adjustedMovement} variant="standard" fullWidth />
        </Grid>
        <Grid size={2}>
          <Button onClick={handleResolve}>Resolve</Button>
        </Grid>
      </Grid>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default ResolveActionDialogMovement;
