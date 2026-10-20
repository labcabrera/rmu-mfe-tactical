import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { ActionParry, AttackDeclaration } from '../../../../api/action.dto';
import ResolveAttackInfo from '../../../action-dialogs/attack/ResolveAttackInfo';

/**
 * Parry step of a melee attack: the attack rolls so far, then one field per defender (or protector) with the
 * parry it spends, capped by what that actor has left across its parries. A defender has one parry per attacker and
 * round (§9.6): one carried over from an earlier action is shown fixed. A protector shows where it stands and the
 * OB that costs it.
 */
const ParryStep: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, setFormData }) => {
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
      {parries.map((parry, index) => (
        <Stack key={parry.id} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {actorName(parry.actorId)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {describe(parry)}
            </Typography>
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
    </Stack>
  );
};

export default ParryStep;
