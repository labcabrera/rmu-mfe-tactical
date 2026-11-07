import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { OPEN_D100, RollCard, RollField } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DIFFICULTY_TABLE, ParryDeclarationItem } from '../../../../api/action.dto';
import { ActorRound } from '../../../../api/actor-rounds.dto';
import { actorOpenEnded } from '../../../../services/combat-talents-service';
import DifficultySelect from '../../../../shared/selects/DifficultySelect';

/** What the game master enters for a pending maneuver: the defender's roll, or its outcome without a roll. */
export type ManeuverRollInput = { roll: number | null; difficulty: string; passed: boolean | null };

const MEDIUM = 'm';

export const emptyManeuverInput = (): ManeuverRollInput => ({ roll: null, difficulty: MEDIUM, passed: null });

/** The roll has been entered, or the game master has decided. */
export const isManeuverInputReady = (input: ManeuverRollInput | undefined): boolean =>
  !!input && (input.passed !== null || input.roll !== null);

/** What the API takes for the maneuver of a parry: the roll and its difficulty, or the game master's outcome. */
export const parryManeuverFields = (input: ManeuverRollInput | undefined): Partial<ParryDeclarationItem> => {
  if (!input) return {};
  if (input.passed !== null) return { maneuverResult: input.passed ? 'success' : 'failure' };
  return input.roll !== null ? { maneuverRoll: input.roll, maneuverDifficulty: input.difficulty } : {};
};

/** The penalties of the actor: the API takes them when it resolves the maneuver, and the prediction uses the same sum. */
export const maneuverPenaltyOf = (actor: ActorRound | undefined): number =>
  Math.min(
    0,
    (actor?.penalty?.modifiers ?? []).reduce((sum, modifier) => sum + modifier.value, 0)
  );

/**
 * An absolute maneuver of a defender in the parry step (workspace spec 077 and 084): its roll, the difficulty (Medium by
 * default) and the predicted total. The game master may instead mark it passed or failed without a roll.
 */
const ManeuverRollFields: FC<{
  label: string;
  input: ManeuverRollInput;
  onChange: (input: ManeuverRollInput) => void;
  skill: number;
  penalty: number;
  actor?: ActorRound;
  disabled?: boolean;
}> = ({ label, input, onChange, skill, penalty, actor, disabled }) => {
  const { t } = useTranslation();
  const set = (patch: Partial<ManeuverRollInput>) => onChange({ ...input, ...patch });
  const difficulty = DIFFICULTY_TABLE.find((each) => each.key === input.difficulty)?.value ?? 0;
  const predicted = input.roll !== null ? input.roll + skill + penalty + difficulty : null;
  // Workspace spec 085, 2.4: the same card as the other rolls of the attack
  return (
    <RollCard
      title={label}
      status={isManeuverInputReady(input) ? 'done' : 'pending'}
      statusText={
        input.passed === null ? undefined : t(input.passed ? 'shield-maneuver-passed' : 'shield-maneuver-failed')
      }
      field={
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', flexWrap: 'wrap', rowGap: 1 }}>
          <Box sx={{ minWidth: 200, flex: 1 }}>
            <RollField
              spec={OPEN_D100}
              label={label}
              value={input.roll}
              onChange={(roll) => set({ roll: roll.total, passed: null })}
              onClear={() => set({ roll: null })}
              disabled={disabled || input.passed !== null}
              openEnded={actorOpenEnded(actor)}
            />
          </Box>
          <DifficultySelect
            value={input.difficulty}
            onChange={(value) => set({ difficulty: value })}
            disabled={disabled || input.passed !== null}
          />
        </Stack>
      }
      total={predicted !== null && input.passed === null ? predicted : undefined}
      totalLabel={t('predicted-total')}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {t('shield-maneuver-manual')}
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={input.passed === null ? null : input.passed ? 'passed' : 'failed'}
          onChange={(_, value: string | null) =>
            set({ passed: value === null ? null : value === 'passed', roll: value === null ? input.roll : null })
          }
          disabled={disabled}
          aria-label={t('shield-maneuver-manual')}
        >
          <ToggleButton value="passed" color="success">
            {t('shield-maneuver-passed')}
          </ToggleButton>
          <ToggleButton value="failed" color="error">
            {t('shield-maneuver-failed')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </RollCard>
  );
};

export default ManeuverRollFields;
