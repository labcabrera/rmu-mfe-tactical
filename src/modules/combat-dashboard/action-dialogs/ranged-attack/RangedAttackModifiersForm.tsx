import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { Action, AttackDeclaration } from '../../../api/action.dto';
import { ActorRoundAttack } from '../../../api/actor-rounds.dto';
import SelectAttackRange from '../../../shared/selects/SelectAttackRange';
import AttackModifiersForm from '../attack-modifiers/AttackModifiersForm';
import AttackTitle from '../melee-attack/AttackTitle';

const RangedAttackModifiersForm: FC<{
  action: Action;
  attack: ActorRoundAttack;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
}> = ({ attack, formData, setFormData, index }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const formDataAttack = formData.attacks?.[index];
  const modifiers = formDataAttack?.modifiers;
  const target = actorRounds?.find((actorRound) => actorRound.actorId === modifiers?.targetId);

  if (!formDataAttack || !modifiers) return null;

  const onRangeChange = (value: number | null) =>
    setFormData((prev) => ({
      ...prev,
      attacks: prev.attacks.map((a, i) => (i === index ? { ...a, modifiers: { ...a.modifiers, range: value } } : a)),
    }));

  return (
    <Stack spacing={1.5}>
      {target && <AttackTitle attack={formDataAttack} target={target} />}
      <AttackModifiersForm
        formData={formData}
        setFormData={setFormData}
        index={index}
        kind="ranged"
        target={target}
        situationExtra={
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              {t('range')}
            </Typography>
            <SelectAttackRange attack={attack} value={modifiers.range || null} onChange={onRangeChange} readOnly={false} />
          </Stack>
        }
      />
    </Stack>
  );
};

export default RangedAttackModifiersForm;
