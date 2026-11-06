import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, Typography } from '@mui/material';
import {
  DeclareShieldManeuverItem,
  formatBonus,
  RuleHint,
  SectionLabel,
  ShieldManeuver,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { ActionAttack } from '../../../../api/action.dto';
import ManeuverRollFields, { emptyManeuverInput, ManeuverRollInput, maneuverPenaltyOf } from './ManeuverRollFields';
import { attackLabel } from './attack-label';

export type ShieldManeuverInput = ManeuverRollInput;

/** A Shield maneuver still waiting for its roll (workspace spec 077, decision A1.2). */
export const isShieldManeuverPending = (maneuver: ShieldManeuver | undefined): boolean =>
  !!maneuver?.required && (maneuver.passed === null || maneuver.passed === undefined);

/** Attacks of the action that need a Shield maneuver of their defender. */
export const shieldManeuverAttacks = (attacks: ActionAttack[]): ActionAttack[] =>
  attacks.filter((attack) => !!attack.shieldManeuver?.required);

/** The maneuvers of the form to send with the parry: a roll, or the game master's outcome (`passed` alone). */
export const shieldManeuverItems = (
  attacks: ActionAttack[],
  inputs: Record<string, ShieldManeuverInput>
): DeclareShieldManeuverItem[] =>
  attacks
    .filter((attack) => isShieldManeuverPending(attack.shieldManeuver))
    .map((attack) => ({ attack, input: inputs[attack.attackName] }))
    .filter(({ input }) => !!input && (input.passed !== null || input.roll !== null))
    .map(({ attack, input }) =>
      input.passed !== null
        ? { attackName: attack.attackName, passed: input.passed }
        : { attackName: attack.attackName, roll: input.roll!, difficulty: input.difficulty }
    );

/** Chip of a Shield maneuver already decided: passed or failed, with its total or the game master's call. */
export const ShieldManeuverChip: FC<{ maneuver: ShieldManeuver }> = ({ maneuver }) => {
  const { t } = useTranslation();
  if (!maneuver.required) return null;
  const pending = isShieldManeuverPending(maneuver);
  const state = pending ? 'pending' : maneuver.passed ? 'passed' : 'failed';
  const detail = maneuver.manual
    ? t('shield-maneuver-manual')
    : maneuver.total !== null && maneuver.total !== undefined
      ? t('total-value', { value: maneuver.total })
      : '';
  return (
    <Chip
      size="small"
      variant="outlined"
      color={pending ? 'warning' : maneuver.passed ? 'success' : 'error'}
      label={[`${t('shield-maneuver')}: ${t(`shield-maneuver-${state}`)}`, detail].filter(Boolean).join(' · ')}
    />
  );
};

/**
 * Shield maneuvers of the parry step (workspace spec 077, decisions A1.2-A1.4): from the second attack a shield covers
 * in the round, its defender rolls an absolute Shield maneuver with its Shield skill, its penalties and a difficulty
 * (Medium by default). The game master may instead mark it passed or failed without a roll. A failed one leaves the
 * shield out of the attack, and the block is spent anyway.
 */
const ShieldManeuverSection: FC<{
  attacks: ActionAttack[];
  inputs: Record<string, ShieldManeuverInput>;
  onInput: (attackName: string, input: ShieldManeuverInput) => void;
  disabled?: boolean;
}> = ({ attacks, inputs, onInput, disabled }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const required = shieldManeuverAttacks(attacks);
  if (required.length === 0) return null;

  const defender = (id: string) => actorRounds?.find((each) => each.actorId === id);
  const inputOf = (attackName: string): ShieldManeuverInput => inputs[attackName] ?? emptyManeuverInput();

  return (
    <Stack spacing={1.5}>
      <RuleHint title={t('shield-maneuver')} description={t('shield-maneuver-help')} reference="§9.6">
        <SectionLabel>{t('shield-maneuver')}</SectionLabel>
      </RuleHint>
      {required.map((attack) => {
        const maneuver = attack.shieldManeuver!;
        const actor = defender(maneuver.targetId);
        const pending = isShieldManeuverPending(maneuver);
        const input = inputOf(attack.attackName);
        const penalty = maneuver.penalty ?? maneuverPenaltyOf(actor);
        return (
          <Box key={attack.attackName} sx={{ borderLeft: 3, borderColor: 'divider', pl: 1.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {actor?.actorName ?? maneuver.targetId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[
                  attackLabel(attack.attackName, t),
                  `${t('shield')} ${formatBonus(maneuver.skill)}`,
                  penalty ? `${t('penalty')} ${formatBonus(penalty)}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
              <ShieldManeuverChip maneuver={maneuver} />
            </Stack>
            {pending && (
              <Box sx={{ mt: 1 }}>
                <ManeuverRollFields
                  label={t('shield-maneuver')}
                  input={input}
                  onChange={(value) => onInput(attack.attackName, value)}
                  skill={maneuver.skill}
                  penalty={penalty}
                  actor={actor}
                  disabled={disabled}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

export default ShieldManeuverSection;
