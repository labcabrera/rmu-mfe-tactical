import React, { Dispatch, FC, SetStateAction, useContext, useEffect, useState } from 'react';
import { Button, Chip, Grid, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { resolveMovement } from '../../../api/action';
import { Action, ActionMovement } from '../../../api/action.dto';
import type { Character } from '../../../api/characters';
import type { StrategicGame } from '../../../api/strategic-games';
import type { TacticalGame } from '../../../api/tactical-games';
import KeyValueModifiersView from '../../../shared/generic/KeyValueModifiersView';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectBoolean from '../../../shared/selects/SelectBoolean';
import SelectDifficulty from '../../../shared/selects/SelectDifficulty';
import SelectMovementSkill from '../../../shared/selects/SelectMovementSkill';
import SelectPace, { Pace } from '../../../shared/selects/SelectPace';

const ActionMovementModifiersForm: FC<{
  formData: ActionMovement;
  setFormData: Dispatch<SetStateAction<ActionMovement>>;
  character: Character;
  game: TacticalGame;
  strategicGame: StrategicGame;
  action: Action;
}> = ({ formData, setFormData, character, game, strategicGame, action }) => {
  const [paceMultiplier, setPaceMultiplier] = useState<number | null>(null);
  const [movement, setMovement] = useState<number | null>(null);
  const [adjustedMovement, setAdjustedMovement] = useState<number | null>(null);
  const [skillBonus, setSkillBonus] = useState<number | null>(null);
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
    const skill = character.skills.find((s) => s.skillId === value);
    setSkillBonus(skill ? skill.totalBonus : 0);
  };

  const onResolve = () => {
    resolveMovement(action.id, formData)
      .then((result: Action) => {
        updateAction(result);
      })
      .catch((err: Error) => showError(err.message));
  };

  useEffect(() => {
    const skill = character.skills.find((s) => s.skillId === 'running');
    setSkillBonus(skill ? skill.totalBonus : 0);
  }, [character]);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <SelectMovementSkill
          value={formData.modifiers.skillId}
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
      {formData.modifiers.pace && (
        <>
          <Grid size={12}>
            <SelectBoolean
              name="Required maneuver"
              value={formData.modifiers.requiredManeuver}
              onChange={(val) =>
                setFormData({ ...formData, modifiers: { ...formData.modifiers, requiredManeuver: val } })
              }
              readOnly={action.status === 'completed'}
            />
          </Grid>
        </>
      )}
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
                    setFormData({ ...formData, modifiers: { ...formData.modifiers, customModifier: val } })
                  }
                  integer
                />
              </Grid>
              <Grid size={2}>
                <NumericInput
                  label="Roll"
                  value={formData.roll.roll}
                  onChange={(val: number | null) => setFormData({ ...formData, roll: { roll: val } })}
                  integer
                />
              </Grid>
              <Grid size={12}></Grid>
            </>
          )}
        </>
      )}
      {formData.modifiers.pace && !action.movement?.calculated && (
        <Grid size={12}>
          <Typography variant="h6">Estimated</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`Action points: ${getActionPoints()}`} />
            <Chip label={`Maneuver penalty: ${character.equipment.maneuverPenalty}`} />
            <Chip label={`Skill bonus: ${skillBonus !== null ? `${skillBonus > 0 ? '+' : ''}${skillBonus}` : ''}`} />
          </Stack>
          <Stack direction="row" spacing={1} mt={1}>
            <Chip label={`BMR: ${character.movement.baseMovementRate}'`} />
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
      {action.status !== 'completed' && (
        <Button
          onClick={onResolve}
          disabled={!formData.modifiers.pace || (formData.modifiers.requiredManeuver && !formData.roll)}
          variant="contained"
          color="success"
        >
          {t('resolve')}
        </Button>
      )}
      {action.movement && action.movement.calculated && (
        <>
          <Grid size={12}>
            <Typography variant="h6">Result</Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip
                label={`Percent: ${action.movement.calculated.percent}%`}
                color={action.movement.calculated.percent < 100 ? 'error' : 'success'}
              />
            </Stack>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip label={`Action points: ${action.actionPoints}`} />
            </Stack>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip label={`BMR: ${action.movement.calculated.bmr}'`} />
              <Chip label={`Pace x${action.movement.calculated.paceMultiplier}`} />
              <Chip label={`Distance: ${action.movement.calculated.distance}'`} />
              <Chip label={`Adjusted: ${action.movement.calculated.distanceAdjusted}`} />
            </Stack>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip label={`Fatigue: ${action.fatigue || '0'}`} />
            </Stack>
          </Grid>

          {action.movement.roll && action.movement.roll.modifiers && (
            <>
              <Grid size={12}>
                <Typography variant="h6">Modifiers</Typography>
                <Stack direction="row" spacing={1} mt={1} mb={1}>
                  <Chip label={`Total: ${action.movement.roll.totalRoll}`} />
                </Stack>
                <KeyValueModifiersView modifiers={formData.roll.modifiers || []} />
              </Grid>
            </>
          )}
        </>
      )}
      <Grid size={12}>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </Grid>
      <Grid size={12}>
        <pre>{JSON.stringify(action, null, 2)}</pre>
      </Grid>
    </Grid>
  );
};

export default ActionMovementModifiersForm;
