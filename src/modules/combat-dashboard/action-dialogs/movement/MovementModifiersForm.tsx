/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { Chip, Grid, Stack, Typography } from '@mui/material';
import { NumericInput, OpenEndedRollInput, StrategicGame, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action, ActionMovement } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { useSkillService } from '../../../services/skill-service';
import SelectBoolean from '../../../shared/selects/SelectBoolean';
import SelectDifficulty from '../../../shared/selects/SelectDifficulty';
import SelectMovementSkill from '../../../shared/selects/SelectMovementSkill';
import SelectPace, { Pace } from '../../../shared/selects/SelectPace';
import MovementResult from './MovementResult';

const MovementModifiersForm: FC<{
  formData: ActionMovement;
  setFormData: Dispatch<SetStateAction<ActionMovement>>;
  actorRound: ActorRound;
  game: TacticalGame;
  strategicGame: StrategicGame;
  action: Action;
}> = ({ formData, setFormData, actorRound, game, strategicGame, action }) => {
  const [paceMultiplier, setPaceMultiplier] = useState<number | null>(null);
  const [movement, setMovement] = useState<number | null>(null);
  const [adjustedMovement, setAdjustedMovement] = useState<number | null>(null);
  const [skillBonus, setSkillBonus] = useState<number | null>(null);
  const { getSkillBonus } = useSkillService();

  const getActionPoints = () => {
    const startPhase = action.phaseStart;
    const currentPhase = parseInt(game.phase.replace('phase_', ''));
    return currentPhase - startPhase + 1;
  };

  const handlePaceChange = (value: string, pace: Pace) => {
    setFormData({ ...formData, modifiers: { ...formData.modifiers, pace: value } });
    setPaceMultiplier(pace.multiplier);
    const actionPoints = getActionPoints();
    const movementValue = actorRound.movement.bmr * pace.multiplier * actionPoints;
    const scaleMultiplier = strategicGame?.options?.boardScaleMultiplier || 1;
    const adjustedMovementValue = movementValue * scaleMultiplier;
    setMovement(Number(movementValue.toFixed(2)));
    setAdjustedMovement(Number(adjustedMovementValue.toFixed(1)));
  };

  const handleDifficultyChange = (value: string) => {
    setFormData({ ...formData, modifiers: { ...formData.modifiers, difficulty: value } });
  };

  const handleMovementSkillChange = (skillId: string) => {
    setFormData({ ...formData, modifiers: { ...formData.modifiers, skillId: skillId } });
    const bonus = getSkillBonus(skillId, actorRound);
    setSkillBonus(typeof bonus === 'number' ? bonus : null);
  };

  useEffect(() => {
    const skillId = formData?.modifiers?.skillId;
    if (!skillId) {
      setSkillBonus(null);
      return;
    }
    const bonus = getSkillBonus(skillId, actorRound);
    setSkillBonus(typeof bonus === 'number' ? bonus : null);
  }, [actorRound, formData?.modifiers?.skillId]);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <SelectMovementSkill
          value={formData.modifiers.skillId || ''}
          onChange={handleMovementSkillChange}
          readOnly={action.status === 'completed'}
        />
      </Grid>
      <Grid size={12}>
        <SelectPace
          value={formData.modifiers.pace}
          onChange={(v, p) => handlePaceChange(v, p)}
          readOnly={action.status === 'completed'}
        />
      </Grid>
      <Grid size={12}>
        <SelectBoolean
          id="required-maneuver"
          name="Required maneuver"
          value={formData.modifiers.requiredManeuver}
          onChange={(val) => setFormData({ ...formData, modifiers: { ...formData.modifiers, requiredManeuver: val } })}
          readOnly={action.status === 'completed'}
        />
      </Grid>
      {formData.modifiers.requiredManeuver && (
        <>
          <Grid size={12}>
            <SelectDifficulty
              value={formData.modifiers.difficulty}
              onChange={handleDifficultyChange}
              readOnly={action.status === 'completed'}
            />
          </Grid>
          {action.status !== 'completed' && (
            <>
              <Grid size={12}></Grid>
              <Grid size={2}>
                <NumericInput
                  label="Custom modifier"
                  value={formData.modifiers.customModifier}
                  onChange={(val: number | null) =>
                    setFormData({ ...formData, modifiers: { ...formData.modifiers, customModifier: val || 0 } })
                  }
                  integer
                />
              </Grid>
              <Grid size={12}>
                <OpenEndedRollInput onChange={(v) => setFormData({ ...formData, roll: { roll: v } })} />
              </Grid>
              <Grid size={12}>
                {formData.roll && formData.roll.roll && <Typography>Roll: {formData.roll.roll}</Typography>}
              </Grid>
            </>
          )}
        </>
      )}
      {formData.modifiers.pace && !action.movement?.calculated && (
        <Grid size={12}>
          <Typography variant="h6">Estimated</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`Action points: ${getActionPoints()}`} />
            <Chip label={`Maneuver penalty: ${actorRound.movement.penalty}`} />
            <Chip label={`Skill bonus: ${skillBonus !== null ? `${skillBonus > 0 ? '+' : ''}${skillBonus}` : ''}`} />
          </Stack>
          <Stack direction="row" spacing={1} mt={1}>
            <Chip label={`BMR: ${actorRound.movement.bmr}'`} />
            {formData?.modifiers?.pace && (
              <>
                <Chip label={`Pace x${paceMultiplier}`} />
                <Chip label={`Distance: ${movement !== null ? `${movement}'` : ''}`} />
                <Chip label={`Adjusted: ${adjustedMovement !== null ? `${adjustedMovement}` : ''}`} />
              </>
            )}
          </Stack>
        </Grid>
      )}
      {action.movement && action.movement.calculated && <MovementResult action={action} />}
    </Grid>
  );
};

export default MovementModifiersForm;
