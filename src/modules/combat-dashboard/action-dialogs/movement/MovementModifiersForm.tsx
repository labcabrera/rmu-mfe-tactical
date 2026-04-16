/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { Chip, Grid, Stack, Typography } from '@mui/material';
import { NumericInput, OpenEndedRollInput, StrategicGame, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action, ActionMovement } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { useSkillService } from '../../../services/skill-service';
import DialogSelect from '../../../shared/DialogSelect';
import SelectDifficultyDialog from '../../../shared/SelectDificultyDialog';
import MovementPaceTableSelector from './MovementPaceTableSelector';
import MovementResult from './MovementResult';

const MovementModifiersForm: FC<{
  formData: ActionMovement;
  setFormData: Dispatch<SetStateAction<ActionMovement>>;
  actorRound: ActorRound;
  game: TacticalGame;
  strategicGame: StrategicGame;
  action: Action;
}> = ({ formData, setFormData, actorRound, game, strategicGame, action }) => {
  const [skillBonus, setSkillBonus] = useState<number | null>(null);
  const { getSkillBonus } = useSkillService();
  const isCompleted = action.status === 'completed';

  const getActionPoints = () => {
    const startPhase = action.phaseStart;
    const currentPhase = parseInt(game.phase.replace('phase_', ''));
    return currentPhase - startPhase + 1;
  };

  const handleDifficultyChange = (value: string) => {
    setFormData({ ...formData, modifiers: { ...formData.modifiers, difficulty: value } });
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
      <Grid size={4}>
        <DialogSelect
          label="Skill"
          value={formData.modifiers.skillId}
          options={['running', 'swimming', 'climbing', 'flying']}
          onChange={(e) => setFormData({ ...formData, modifiers: { ...formData.modifiers, skillId: e as string } })}
          readOnly={isCompleted}
        />
      </Grid>
      <Grid size={4}>
        <DialogSelect
          label="Required maneuver"
          value={formData.modifiers.requiredManeuver === true ? 'yes' : 'no'}
          options={['yes', 'no']}
          onChange={(e) =>
            setFormData({ ...formData, modifiers: { ...formData.modifiers, requiredManeuver: e === 'yes' } })
          }
          readOnly={isCompleted}
        />
      </Grid>

      {formData.modifiers.requiredManeuver && (
        <>
          <Grid size={4}>
            <SelectDifficultyDialog
              value={formData.modifiers.difficulty}
              onChange={(e) => handleDifficultyChange(e)}
              readOnly={isCompleted}
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
      <Grid size={12}>
        <MovementPaceTableSelector
          actorRound={actorRound}
          formData={formData}
          setFormData={setFormData}
          game={game}
          strategicGame={strategicGame}
          action={action}
          readonly={isCompleted}
        />
      </Grid>
      {formData.modifiers.pace && !action.movement?.calculated && (
        <Grid size={12}>
          <Typography variant="h6">Estimated</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`Action points: ${getActionPoints()}`} />
            <Chip label={`Maneuver penalty: ${actorRound.movement.penalty}`} />
            <Chip label={`Skill bonus: ${skillBonus !== null ? `${skillBonus > 0 ? '+' : ''}${skillBonus}` : ''}`} />
          </Stack>
        </Grid>
      )}
      {action.movement && action.movement.calculated && <MovementResult action={action} />}
    </Grid>
  );
};

export default MovementModifiersForm;
