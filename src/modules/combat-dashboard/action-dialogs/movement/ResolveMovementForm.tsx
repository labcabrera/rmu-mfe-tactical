import React, { FC, useContext, useState } from 'react';
import { Button, FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { resolveMovement } from '../../../api/action';
import { Action, ActionMovement } from '../../../api/action.dto';
import type { Character } from '../../../api/characters';
import type { StrategicGame } from '../../../api/strategic-games';
import type { TacticalGame } from '../../../api/tactical-games';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import NumericReadonlyInput from '../../../shared/inputs/NumericReadonlyInput';
import SelectDifficulty from '../../../shared/selects/SelectDifficulty';
import SelectMovementSkill from '../../../shared/selects/SelectMovementSkill';
import SelectPace, { Pace } from '../../../shared/selects/SelectPace';

const ResolveMovementForm: FC<{
  formData: ActionMovement;
  setFormData: (data: ActionMovement) => void;
  character: Character;
  game: TacticalGame;
  strategicGame: StrategicGame;
  action: Action;
}> = ({ formData, setFormData, character, game, strategicGame, action }) => {
  const [paceMultiplier, setPaceMultiplier] = useState<number | null>(null);
  const [movement, setMovement] = useState<number | null>(null);
  const [adjustedMovement, setAdjustedMovement] = useState<number | null>(null);
  const { updateAction } = useContext(CombatContext)!;
  const { showError } = useError();

  const getActionPoints = () => {
    const startPhase = action.phaseStart;
    const currentPhase = parseInt(game.phase.replace('phase_', ''));
    return currentPhase - startPhase + 1;
  };

  const handlePaceChange = (value: string, pace: Pace) => {
    setFormData({ ...formData, modifiers: { ...formData.modifiers, pace: value } });
    setPaceMultiplier(pace.multiplier);
    const actionPoints = getActionPoints();
    const movementValue = character.movement.baseMovementRate * pace.multiplier * actionPoints;
    const scaleMultiplier = strategicGame?.options?.boardScaleMultiplier || 1;
    const adjustedMovementValue = movementValue * scaleMultiplier;
    setMovement(Number(movementValue.toFixed(2)));
    setAdjustedMovement(Number(adjustedMovementValue.toFixed(1)));
  };

  const handleDifficultyChange = (value: string) => {
    setFormData({ ...formData, modifiers: { ...formData.modifiers, difficulty: value } });
  };

  const handleMovementSkillChange = (value: string) => {
    setFormData({ ...formData, modifiers: { ...formData.modifiers, skillId: value } });
  };

  const onResolve = () => {
    resolveMovement(action.id, formData)
      .then((result: Action) => {
        updateAction(result);
      })
      .catch((err: Error) => showError(err.message));
  };

  return (
    <Grid container spacing={2}>
      <Grid size={2}>
        <SelectPace value={formData.modifiers.pace} name="pace" onChange={(v, p) => handlePaceChange(v, p)} />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label="Action points" name="actionPoints" value={getActionPoints()} />
      </Grid>
      <Grid size={2}>
        <TextField
          label="BMR"
          name="bmr"
          value={`${character.movement.baseMovementRate}'`}
          variant="standard"
          fullWidth
          sx={{
            '& input': {
              textAlign: 'right',
            },
          }}
        />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label="Pace multiplier" name="paceMultiplier" value={paceMultiplier} />
      </Grid>
      <Grid size={2}>
        <TextField
          label="Movement"
          name="movement"
          value={movement !== null ? `${movement}'` : ''}
          variant="standard"
          fullWidth
          sx={{
            '& input': {
              textAlign: 'right',
            },
          }}
        />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label="Adjusted movement" name="adjustedMovement" value={adjustedMovement} />
      </Grid>
      <Grid size={2}>
        <TextField
          label="Maneuver penalty"
          name="maneuverPenalty"
          value={character.equipment.maneuverPenalty}
          variant="standard"
          fullWidth
        />
      </Grid>
      <Grid size={2}>
        <SelectDifficulty value={formData.modifiers.difficulty} onChange={handleDifficultyChange} />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.modifiers.requiredManeuver}
              onChange={(e) =>
                setFormData({ ...formData, modifiers: { ...formData.modifiers, requiredManeuver: e.target.checked } })
              }
            />
          }
          label="Required maneuver"
        />
      </Grid>
      <Grid size={12}>
        {formData.modifiers.requiredManeuver && (
          <>
            <Grid size={2}>
              <SelectMovementSkill value={formData.modifiers.skillId} onChange={handleMovementSkillChange} />
            </Grid>
            <Grid size={2}>
              <NumericInput
                label="Roll"
                value={formData.roll.roll}
                onChange={(val: number | null) => setFormData({ ...formData, roll: { roll: val } })}
                integer
              />
            </Grid>
          </>
        )}
        <Button
          onClick={onResolve}
          disabled={!formData.modifiers.pace || (formData.modifiers.requiredManeuver && !formData.roll)}
        >
          Resolve
        </Button>
      </Grid>
      {action.movement && action.movement.calculated && <Grid size={12}>calculated</Grid>}

      <Grid size={12}>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </Grid>
      <Grid size={12}>
        <pre>{JSON.stringify(action, null, 2)}</pre>
      </Grid>
    </Grid>
  );
};

export default ResolveMovementForm;
