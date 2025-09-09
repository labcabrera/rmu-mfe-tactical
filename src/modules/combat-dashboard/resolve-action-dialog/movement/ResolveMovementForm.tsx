import React, { useState } from 'react';
import { FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import type { Action, ResolveMovementDto } from '../../../api/actions';
import type { Character } from '../../../api/characters';
import type { StrategicGame } from '../../../api/strategic-games';
import type { TacticalGame } from '../../../api/tactical-games';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectDifficulty from '../../../shared/selects/SelectDifficulty';
import SelectMovementSkill from '../../../shared/selects/SelectMovementSkill';
import SelectPace from '../../../shared/selects/SelectPace';

type Pace = {
  value: string;
  multiplier: number;
};

type ResolveMovementFormProps = {
  formData: ResolveMovementDto;
  setFormData: (data: ResolveMovementDto) => void;
  character: Character;
  game: TacticalGame;
  strategicGame: StrategicGame;
  action: Action;
};

const ResolveMovementForm: React.FC<ResolveMovementFormProps> = ({ formData, setFormData, character, game, strategicGame, action }) => {
  const [paceMultiplier, setPaceMultiplier] = useState<number | string>('');
  const [movement, setMovement] = useState<number | string>('');
  const [adjustedMovement, setAdjustedMovement] = useState<number | string>('');

  const handlePaceChange = (value: string, pace: Pace) => {
    setFormData({ ...formData, pace: value });
    setPaceMultiplier(pace.multiplier);
    const actionPoints = getActionPoints();
    const movementValue = character.movement.baseMovementRate * pace.multiplier * actionPoints;
    const scaleMultiplier = strategicGame?.options?.boardScaleMultiplier || 1;
    const adjustedMovementValue = movementValue * scaleMultiplier;
    setMovement(movementValue);
    setAdjustedMovement(`${adjustedMovementValue} (x${scaleMultiplier})`);
  };

  const getActionPoints = () => {
    const startPhase = action.phaseStart;
    const currentPhase = parseInt(game.phase.replace('phase_', ''));
    return currentPhase - startPhase + 1;
  };

  const handleDifficultyChange = (value: string) => {
    setFormData({ ...formData, difficulty: value });
  };

  const handleMovementSkillChange = (value: string) => {
    setFormData({ ...formData, skillId: value });
  };

  return (
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
        <TextField label="Maneuver penalty" name="maneuverPenalty" value={character.equipment.maneuverPenalty} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <SelectDifficulty value={formData.difficulty} onChange={handleDifficultyChange} />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <FormControlLabel
          control={<Switch checked={formData.requiredManeuver} onChange={(e) => setFormData({ ...formData, requiredManeuver: e.target.checked })} />}
          label="Required maneuver"
        />
      </Grid>
      <Grid size={12}></Grid>
      {formData.requiredManeuver && (
        <>
          <Grid size={2}>
            <SelectMovementSkill value={formData.skillId} onChange={handleMovementSkillChange} />
          </Grid>
          <Grid size={2}>
            <NumericInput label="Roll" value={formData.roll} onChange={(val: number | null) => setFormData({ ...formData, roll: val })} integer />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default ResolveMovementForm;
