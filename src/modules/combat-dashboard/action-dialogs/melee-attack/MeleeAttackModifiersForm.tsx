import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Stack } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclaration } from '../../../api/action.dto';
import AttackModifiersForm from '../attack-modifiers/AttackModifiersForm';
import AttackTitle from './AttackTitle';

const MeleeAttackModifiersForm: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const { actorRounds } = useContext(CombatContext)!;
  const attack = formData.attacks?.[index];
  const target = actorRounds?.find((actorRound) => actorRound.actorId === attack?.modifiers?.targetId);

  if (!attack) return null;

  return (
    <Stack spacing={1.5}>
      {target && <AttackTitle attack={attack} target={target} />}
      <AttackModifiersForm formData={formData} setFormData={setFormData} index={index} kind="melee" target={target} />
    </Stack>
  );
};

export default MeleeAttackModifiersForm;
