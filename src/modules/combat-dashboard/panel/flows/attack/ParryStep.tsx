import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import BlockIcon from '@mui/icons-material/Block';
import { Alert, Box, Stack, Typography } from '@mui/material';
import { combatActionInfo, NumericInput, RuleHint, RuleParams } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { ActionParry, AttackDeclaration, ParryExclusion } from '../../../../api/action.dto';
import ResolveAttackInfo from '../../../action-dialogs/attack/ResolveAttackInfo';
import { attackLabel } from './attack-label';

/**
 * Parry step of a melee attack: the attack rolls so far, then one field per defender (or protector) with the
 * parry it spends, capped by what that actor has left across its parries. A defender has one parry per attacker and
 * round (§9.6): one carried over from an earlier action is shown fixed. A protector shows where it stands and the
 * OB that costs it.
 */
const ParryStep: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  /** Who cannot parry or protect, and why (spec 051). */
  exclusions?: ParryExclusion[];
}> = ({ formData, setFormData, exclusions = [] }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const parries = formData.parries ?? [];
  const actorName = (id: string) => actorRounds?.find((a) => a.actorId === id)?.actorName ?? '';

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

  const describe = (parry: ActionParry) =>
    [
      t(parry.parryType || 'parry'),
      `${t('available-parry')} ${parry.parryAvailable}`,
      parry.protectPosition && t(`protect-position-${parry.protectPosition}`),
      !!parry.penalty && t('protect-penalty', { value: parry.penalty }),
      parry.carriedOver && t('parry-carried-over'),
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
    return t('parry-consequence', {
      parry: parry.parry,
      attack: attackLabel(b.attackName, t),
      left: b.bo - cost(parry),
    });
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

  const setParry = (index: number, value: number) =>
    setFormData((prev) => ({
      ...prev,
      parries: (prev.parries ?? []).map((p, i) => (i === index ? { ...p, parry: value } : p)),
    }));

  return (
    <Stack spacing={2}>
      {formData.attacks.map((attack) => (
        <ResolveAttackInfo key={attack.attackName} attack={attack} />
      ))}
      {parries.length === 0 && (
        <Alert severity="info" variant="outlined">
          {exclusions.length > 0 ? t('parry-nobody-because') : t('parry-nobody')}
        </Alert>
      )}
      {parries.map((parry, index) => (
        <Stack key={parry.id} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <RuleHint
              title={actorName(parry.actorId)}
              description={t(parry.parryType === 'protect' ? 'combat-rule-protect' : 'combat-rule-parry')}
              params={ruleParams(parry)}
              reference={parry.parryType === 'protect' ? '§9.7' : '§9.6'}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {actorName(parry.actorId)}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                {describe(parry)}
              </Typography>
              {breakdownText(parry) && (
                <Typography variant="caption" color="text.secondary" component="div">
                  {breakdownText(parry)}
                </Typography>
              )}
            </RuleHint>
            {consequence(parry) && (
              <Typography variant="caption" color="warning.main" component="div" sx={{ mt: 0.5 }}>
                {consequence(parry)}
              </Typography>
            )}
          </Box>
          <Box sx={{ width: 120 }}>
            <NumericInput
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
            <Typography variant="caption" color="text.secondary">
              {t('parry-max', { max: remaining(index) })}
            </Typography>
          </Box>
        </Stack>
      ))}
      {exclusions.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            {t('parry-excluded')}
          </Typography>
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
  );
};

export default ParryStep;
