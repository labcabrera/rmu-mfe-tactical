/* eslint-disable react/prop-types */
import React, { useContext, useState } from 'react';
import { Divider, Grid, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { resolveMovement } from '../../api/actions';
import NumericTextField from '../../shared/inputs/NumericTextField';
import SelectDifficulty from '../../shared/selects/SelectDifficulty';
import SelectMovementSkill from '../../shared/selects/SelectMovementSkill';
import SelectPace from '../../shared/selects/SelectPace';
import ResolveActionDialogMovementStepper from './ResolveActionDialogMovementStepper';

const ResolveActionDialogMovement = ({ action, character }) => {
  const { showError } = useError();
  const { game } = useContext(CombatContext);
  const { strategicGame } = useContext(CombatContext);
  const [paceMultiplier, setPaceMultiplier] = useState('');
  const [movement, setMovement] = useState('');
  const [requiredManeuver, setRequiredManeuver] = useState(true);
  const [adjustedMovement, setAdjustedMovement] = useState('');
  const [formData, setFormData] = useState({
    pace: '',
    difficulty: character.equipment.movementBaseDifficulty || '',
    skill: 'running',
    roll: '',
  });

  const handleResolve = () => {
    resolveMovement(action.id, formData)
      .then((result) => {
        //TODO not implemented api
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

  const handleDifficultyChange = (value) => {
    setFormData({ ...formData, difficulty: value });
  };

  const handleMovementSkillChange = (value) => {
    setFormData({ ...formData, skill: value });
  };

  const getActionPoints = () => {
    //TODO check other actions in previous phases
    const startPhase = action.phaseStart;
    const currentPhase = parseInt(game.phase.replace('phase_', ''));
    return currentPhase - startPhase + 1;
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <ResolveActionDialogMovementStepper />
      </Grid>
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
        <TextField label="Maneuver penalty" name="maneuverPenalty" value={character.equipment.maneuverPenalty} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <SelectDifficulty value={formData.difficulty} onChange={handleDifficultyChange} />
      </Grid>
      <Grid size={2}>
        <SelectMovementSkill value={formData.skill} onChange={handleMovementSkillChange} />
      </Grid>
      <Grid size={12}></Grid>
      <Divider />
      <Grid size={2}>
        <FormControlLabel
          control={<Switch defaultChecked value={requiredManeuver} onChange={(e) => setRequiredManeuver(e.target.checked)} />}
          label="Required maneuver"
        />
      </Grid>
      <Grid size={12}></Grid>
      {requiredManeuver && (
        <Grid size={2}>
          <NumericTextField
            label="Roll"
            value={formData.roll}
            onChange={(val) => setFormData({ ...formData, roll: val })}
            variant="standard"
            fullWidth
          />
        </Grid>
      )}
      <Grid size={12}></Grid>
      <Grid size={2}>
        <Button onClick={handleResolve}>Resolve</Button>
      </Grid>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </Grid>
  );
};

export default ResolveActionDialogMovement;
