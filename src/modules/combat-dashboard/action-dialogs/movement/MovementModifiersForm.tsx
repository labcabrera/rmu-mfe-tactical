/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { Chip, Grid, Stack, Typography } from '@mui/material';
import {
  CategorySeparator,
  NumericInput,
  OpenEndedRollInput,
  StrategicGame,
  TacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
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
  const [skillBonus, setSkillBonus] = useState<number>();
  const { getSkillBonus } = useSkillService();
  const isCompleted = action.status === 'completed';
  const maneuverPenalty = actorRound.movement.penalty;
  const maxPace = actorRound.movement.maxPace;
  const baseDifficulty = actorRound.movement.baseDificulty;

  const getActionPoints = () => {
    const startPhase = action.phaseStart;
    const currentPhase = parseInt(game.phase.replace('phase_', ''));
    return currentPhase - startPhase + 1;
  };

  const handleDifficultyChange = (value: string) => {
    setFormData({ ...formData, modifiers: { ...formData.modifiers, difficulty: value } });
  };

  const getChipColor = (value: number | null | undefined) => {
    if (!value) return 'secondary';
    if (value > 0) return 'success';
    if (value < 1) return 'error';
    return 'secondary';
  };

  useEffect(() => {
    const skillId = formData?.modifiers?.skillId;
    if (!skillId) {
      setSkillBonus(undefined);
      return;
    }
    const bonus = getSkillBonus(skillId, actorRound);
    setSkillBonus(bonus || -20);
  }, [actorRound, formData?.modifiers?.skillId]);

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <Stack direction="row" spacing={1}>
          <Chip color="secondary" label={`Action points: ${getActionPoints()}`} />
          <Chip color={getChipColor(maneuverPenalty)} label={`Maneuver penalty: ${maneuverPenalty}`} />
          <Chip
            color={getChipColor(skillBonus)}
            label={`Skill bonus: ${skillBonus ? `${skillBonus > 0 ? '+' : ''}${skillBonus}` : ''}`}
          />
          <Chip color="secondary" label={`Max pace: ${t(maxPace)}`} />
          <Chip color="secondary" label={`Base difficulty: ${t(baseDifficulty)}`} />
        </Stack>
      </Grid>
      <Grid size={12}>
        <CategorySeparator text="Modifiers" />
      </Grid>
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
      <Grid size={12}>
        <MovementResult action={action} />
      </Grid>
    </Grid>
  );
};

export default MovementModifiersForm;
