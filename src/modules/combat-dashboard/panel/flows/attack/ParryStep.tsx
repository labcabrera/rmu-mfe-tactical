import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import BlockIcon from '@mui/icons-material/Block';
import { Alert, Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import {
  combatActionInfo,
  EntityAvatar,
  formatBonus,
  parryPositionalReduction,
  NumberPadField,
  RuleHint,
  RuleParams,
  SectionLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { ActionParry, AttackDeclaration, ParryExclusion } from '../../../../api/action.dto';
import { useActorRoundOption } from '../../../../services/actor-round-option';
import ResolveAttackInfo from '../../../action-dialogs/attack/ResolveAttackInfo';
import BreakdownColumns from './BreakdownColumns';
import ManeuverRollFields, { emptyManeuverInput, ManeuverRollInput, maneuverPenaltyOf } from './ManeuverRollFields';
import ShieldManeuverSection, { ShieldManeuverInput } from './ShieldManeuverSection';
import { attackLabel } from './attack-label';

/**
 * Parry step of a melee attack: the attack rolls so far, then one field per defender (or protector) with the
 * parry it spends, capped by what that actor has left across its parries. A defender has one parry per attacker and
 * round (§9.6): one carried over from an earlier action is shown fixed. A protector shows where it stands and the
 * OB that costs it. Workspace spec 077: the Shield maneuvers the defenders roll from the second attack their shield
 * covers come first; a ranged attack only goes through this step for them (`withParries` false).
 */
const ParryStep: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  /** Who cannot parry or protect, and why (spec 051). */
  exclusions?: ParryExclusion[];
  /** Actor of the attacks, to show their size (spec 075). */
  sourceActorId?: string;
  /** Shield maneuvers typed so far, by attack (workspace spec 077). */
  shieldInputs?: Record<string, ShieldManeuverInput>;
  onShieldInput?: (attackName: string, input: ShieldManeuverInput) => void;
  /** Melee: the defenders may parry. A ranged attack only rolls its Shield maneuvers here. */
  withParries?: boolean;
}> = ({
  formData,
  setFormData,
  exclusions = [],
  sourceActorId,
  shieldInputs = {},
  onShieldInput = () => undefined,
  withParries = true,
}) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const parries = formData.parries ?? [];
  const actorName = (id: string) => actorRounds?.find((a) => a.actorId === id)?.actorName ?? '';
  const toOption = useActorRoundOption();
  const avatarOf = (id: string) => {
    const actorRound = actorRounds?.find((a) => a.actorId === id);
    return actorRound ? toOption(actorRound).imageUrl : undefined;
  };

  /** OB a parry spends: the parry, plus the protect penalty when it protects with any amount (Table 9-7c). */
  const cost = (parry: ActionParry) => (parry.parry > 0 ? (parry.parry || 0) - (parry.penalty || 0) : 0);

  // Same rule as the API: the parries of one actor share its available OB, the ones carried over from an earlier
  // action against this attacker are already paid, and protecting also spends the protect penalty.
  const remaining = (index: number) => {
    const parry = parries[index];
    if (parry.carriedOver) return parry.parry;
    const own = parries.filter((other) => other.actorId === parry.actorId && !other.carriedOver);
    const available = own.reduce((max, other) => Math.max(max, other.parryAvailable - (other.penalty || 0)), 0);
    const others = parries.reduce((sum, other, i) => (i !== index && own.includes(other) ? sum + cost(other) : sum), 0);
    return Math.max(0, Math.min(parry.parryAvailable, available - others + (parry.penalty || 0)));
  };

  // Workspace spec 085, 2.3: the most it can parry, in words; the technical breakdown goes to a tooltip
  const headline = (parry: ActionParry, index: number) =>
    parry.carriedOver
      ? t('parry-carried-over')
      : t(parry.parryType === 'protect' ? 'protect-up-to' : 'parry-up-to', {
          max: remaining(index),
          attack: parry.breakdown ? attackLabel(parry.breakdown.attackName, t) : '',
        });
  const describe = (parry: ActionParry) =>
    [
      parry.protectPosition && t(`protect-position-${parry.protectPosition}`),
      !!parry.penalty && t('protect-penalty', { value: parry.penalty }),
      parry.positional &&
        t('parry-positional-info', {
          position: t(`positional-${parry.positional.position}`),
          penalty: parry.positional.penalty,
          skill: parry.positional.reverseStrike,
        }),
    ]
      .filter(Boolean)
      .join(' · ');

  // Spec 051: where the most comes from, and what parrying costs the actor's own attack this round
  const breakdownText = (parry: ActionParry) => {
    const b = parry.breakdown;
    if (!b || parry.carriedOver) return undefined;
    const values = { attack: attackLabel(b.attackName, t), bo: b.bo, penalty: b.penalty, max: parry.parryAvailable };
    return parry.parryType === 'protect'
      ? t('protect-breakdown', { ...values, protect: b.protectPenalty ?? 0 })
      : t('parry-breakdown', values);
  };
  const consequence = (parry: ActionParry) => {
    const b = parry.breakdown;
    if (!b || parry.carriedOver || !(parry.parry > 0)) return undefined;
    // Workspace spec 082: a parry lowers every attack of the actor
    const attacks = (actorRounds?.find((a) => a.actorId === parry.actorId)?.attacks ?? [])
      .filter((attack) => !attack.broken)
      .map((attack) => `${attackLabel(attack.attackName, t)} ${Math.max(0, attack.currentBo - cost(parry))}`)
      .join(', ');
    return t('parry-consequence', { parry: parry.parry, attacks });
  };
  const ruleParams = (parry: ActionParry): RuleParams | undefined => {
    const b = parry.breakdown;
    if (!b) return undefined;
    return {
      bo: b.bo,
      penalty: b.penalty,
      ...(parry.parryType === 'protect' ? { protect: b.protectPenalty ?? 0 } : {}),
      max: parry.parryAvailable,
    };
  };
  const exclusionText = (exclusion: ParryExclusion) => {
    // The last action by its type's name; the effect by its own
    const params = Object.fromEntries(
      Object.entries(exclusion.params ?? {}).map(([name, value]) => [
        name,
        name === 'actionType'
          ? t(combatActionInfo(String(value)).labelKey)
          : typeof value === 'string'
            ? t(value)
            : value,
      ])
    );
    if (exclusion.reason === 'parry-last-action' && !exclusion.params?.actionType)
      return t('parry-exclusion-no-action', { type: t(exclusion.parryType) });
    return t(`parry-exclusion-${exclusion.reason}`, { ...params, type: t(exclusion.parryType) });
  };

  // Spec 079, A2: what the flank or rear takes off the parry, and the maneuver against a further foe
  const positionalText = (parry: ActionParry) => {
    const reduction = parryPositionalReduction(parry.parry || 0, parry.positional);
    return reduction > 0
      ? t('parry-positional-reduction', { reduction, left: (parry.parry || 0) - reduction })
      : undefined;
  };
  const maneuverRequired = (parry: ActionParry) => !!parry.parryManeuver?.required && !parry.carriedOver;
  const setManeuverInput = (index: number, value: ManeuverRollInput) =>
    setFormData((prev) => ({
      ...prev,
      parries: (prev.parries ?? []).map((p, i) => (i === index ? { ...p, maneuverInput: value } : p)),
    }));

  const setParry = (index: number, value: number) =>
    setFormData((prev) => ({
      ...prev,
      parries: (prev.parries ?? []).map((p, i) => (i === index ? { ...p, parry: value } : p)),
    }));

  // Workspace spec 085, 2.3: the total of each attack with the parries typed so far (a guide: the API adds the
  // flank or rear reduction and the protect penalty)
  const parryAgainst = (attackName: string, targetId: string) =>
    parries
      .filter((p) => (p.targetAttackName ? p.targetAttackName === attackName : p.targetActorId === targetId))
      .reduce((sum, p) => sum + (p.parry || 0), 0);
  const liveTotals = formData.attacks
    .filter((attack) => attack.calculated && attack.modifiers.targetId)
    .map((attack) => {
      const before = attack.calculated!.rollTotal;
      const parried = parryAgainst(attack.attackName, attack.modifiers.targetId);
      return { attack, before, after: before - parried, parried };
    });

  return (
    <BreakdownColumns
      breakdown={
        <Stack spacing={2}>
          {formData.attacks.map((attack) => (
            <ResolveAttackInfo key={attack.attackName} attack={attack} sourceActorId={sourceActorId} />
          ))}
        </Stack>
      }
    >
      <Stack spacing={2}>
        {withParries && parries.length > 0 && (
          <Stack spacing={0.5}>
            {liveTotals.map(({ attack, before, after, parried }) => (
              <Typography key={attack.attackName} variant="body2">
                {t(parried > 0 ? 'parry-live-total' : 'parry-live-total-unchanged', {
                  attack: `${attackLabel(attack.attackName, t)} → ${actorName(attack.modifiers.targetId)}`,
                  before,
                  after,
                })}
              </Typography>
            ))}
          </Stack>
        )}
        <ShieldManeuverSection attacks={formData.attacks} inputs={shieldInputs} onInput={onShieldInput} />
        {withParries && parries.length === 0 && (
          <Alert severity="info" variant="outlined">
            {exclusions.length > 0 ? t('parry-nobody-because') : t('parry-nobody')}
          </Alert>
        )}
        {parries.map((parry, index) => (
          <Stack
            key={parry.id}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { sm: 'flex-start' }, p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}
          >
            <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
              <EntityAvatar imageUrl={avatarOf(parry.actorId)} name={actorName(parry.actorId)} size={48} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <RuleHint
                  title={actorName(parry.actorId)}
                  description={t(parry.parryType === 'protect' ? 'combat-rule-protect' : 'combat-rule-parry')}
                  params={ruleParams(parry)}
                  reference={parry.parryType === 'protect' ? '§9.7' : '§9.6'}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                    {actorName(parry.actorId)}
                  </Typography>
                </RuleHint>
                <Tooltip title={breakdownText(parry) ?? ''} disableHoverListener={!breakdownText(parry)}>
                  <Typography variant="body2" component="div" sx={{ width: 'fit-content' }}>
                    {headline(parry, index)}
                  </Typography>
                </Tooltip>
                {describe(parry) && (
                  <Typography variant="caption" color="text.secondary" component="div">
                    {describe(parry)}
                  </Typography>
                )}
                {consequence(parry) && (
                  <Typography variant="caption" color="warning.main" component="div" sx={{ mt: 0.5 }}>
                    {consequence(parry)}
                  </Typography>
                )}
                {positionalText(parry) && (
                  <RuleHint
                    title={t('parry-positional')}
                    description={t('combat-rule-parry-positional', {
                      position: t(`positional-${parry.positional!.position}`),
                      penalty: parry.positional!.penalty,
                      skill: parry.positional!.reverseStrike,
                      parry: parry.parry,
                    })}
                    reference="§9.6"
                  >
                    <Typography variant="caption" color="warning.main" component="div" sx={{ mt: 0.5 }}>
                      {positionalText(parry)}
                    </Typography>
                  </RuleHint>
                )}
                {maneuverRequired(parry) && (
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    <RuleHint
                      title={t('parry-maneuver')}
                      description={t('parry-maneuver-help', { foes: parry.parryManeuver!.foes })}
                      reference="§9.6"
                    >
                      <Typography variant="caption" color="text.secondary" component="div">
                        {t('parry-maneuver-required', {
                          foes: parry.parryManeuver!.foes,
                          skill: formatBonus(parry.maneuverSkill ?? 0),
                        })}
                      </Typography>
                    </RuleHint>
                    <ManeuverRollFields
                      label={t('parry-maneuver')}
                      input={parry.maneuverInput ?? emptyManeuverInput()}
                      onChange={(value) => setManeuverInput(index, value)}
                      skill={parry.maneuverSkill ?? 0}
                      penalty={maneuverPenaltyOf(actorRounds?.find((a) => a.actorId === parry.actorId))}
                      actor={actorRounds?.find((a) => a.actorId === parry.actorId)}
                    />
                    {parry.parryManeuver?.passed === false && (
                      <Typography variant="caption" color="warning.main">
                        {t('parry-maneuver-failed', { result: t(parry.parryManeuver.result ?? '') })}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>
            </Stack>
            <Stack spacing={0.5} sx={{ width: { xs: '100%', sm: 200 }, flexShrink: 0 }}>
              <NumberPadField
                steps={[-10, -5, 5, 10]}
                label={t('parry')}
                value={parry.parry}
                onChange={(value) => setParry(index, value ?? 0)}
                integer
                allowNegatives={false}
                min={0}
                max={remaining(index)}
                disabled={!!parry.carriedOver}
                error={(parry.parry || 0) > remaining(index)}
              />
              {!parry.carriedOver && (
                <Stack direction="row" spacing={0.5}>
                  {[
                    ['0', 0],
                    [t('ob-half'), Math.floor(remaining(index) / 2)],
                    [t('parry-max-short'), remaining(index)],
                  ].map(([label, value]) => (
                    <Button
                      key={String(label)}
                      size="small"
                      variant={(parry.parry || 0) === value ? 'contained' : 'outlined'}
                      onClick={() => setParry(index, value as number)}
                      sx={{ minWidth: 0, flex: 1 }}
                    >
                      {label}
                    </Button>
                  ))}
                </Stack>
              )}
            </Stack>
          </Stack>
        ))}
        {exclusions.length > 0 && (
          <Stack spacing={1}>
            <SectionLabel>{t('parry-excluded')}</SectionLabel>
            {exclusions.map((exclusion) => (
              <Stack
                key={`${exclusion.actorId}-${exclusion.targetActorId}-${exclusion.parryType}`}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'flex-start' }}
              >
                <BlockIcon fontSize="small" color="disabled" sx={{ mt: 0.25 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {exclusion.parryType === 'protect'
                      ? t('protect-excluded-title', {
                          name: actorName(exclusion.actorId),
                          target: actorName(exclusion.targetActorId),
                        })
                      : actorName(exclusion.actorId)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {exclusionText(exclusion)}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </BreakdownColumns>
  );
};

export default ParryStep;
