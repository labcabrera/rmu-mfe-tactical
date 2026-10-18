import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { AttackDeclaration } from '../../../../api/action.dto';
import ResolveAttackInfo from '../../../action-dialogs/attack/ResolveAttackInfo';

/**
 * Parry step of a melee attack: the attack rolls so far, then one field per defender (or protector) with the
 * parry it spends, capped by what that actor has left across its parries.
 */
const ParryStep: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, setFormData }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const parries = formData.parries ?? [];
  const actorName = (id: string) => actorRounds?.find((a) => a.actorId === id)?.actorName ?? '';

  const remaining = (index: number) => {
    const parry = parries[index];
    const others = parries.reduce(
      (sum, other, i) => (i !== index && other.actorId === parry.actorId ? sum + (other.parry || 0) : sum),
      0
    );
    return Math.max(0, parry.parryAvailable - others);
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
      {parries.map((parry, index) => (
        <Stack key={parry.id} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {actorName(parry.actorId)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {`${t(parry.parryType || 'parry')} · ${t('available-parry')} ${parry.parryAvailable}`}
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
