import React, { ChangeEvent, Dispatch, FC, SetStateAction, useContext } from 'react';
import { Grid } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclaration } from '../../../api/action.dto';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectCalledShot from '../../../shared/selects/SelectCalledShot';
import SelectDodge from '../../../shared/selects/SelectDodge';
import SelectMeleeCover from '../../../shared/selects/SelectMeleeCover';
import SelectPace from '../../../shared/selects/SelectPace';
import SelectPositionalSource from '../../../shared/selects/SelectPositionalSource';
import SelectPositionalTarget from '../../../shared/selects/SelectPositionalTarget';
import SelectRestrictedQuarters from '../../../shared/selects/SelectRestrictedQuarters';
import AttackTitle from './AttackTitle';
import MeleeAttackDefensiveOptions from './MeleeAttackDefensiveOptions';
import MeleeAttackOptions from './MeleeAttackOptions';

const MeleeAttackModifiersForm: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const { actorRounds } = useContext(CombatContext);

  const attack = formData.attacks?.[index];
  const modifiers = attack?.modifiers;
  const customBonus = modifiers?.customBonus || null;
  const cover = modifiers?.cover || '';
  const restrictedQuarters = modifiers?.restrictedQuarters || '';
  const positionalSource = modifiers?.positionalSource || '';
  const positionalTarget = modifiers?.positionalTarget || '';
  const dodge = modifiers?.dodge || '';
  const pace = modifiers?.pace || '';
  const target = actorRounds.find((actorRound) => actorRound.actorId === modifiers?.targetId);

  const handleChange = (name: string, value: string | boolean) => {
    const newAttacks = formData.attacks.map((a, i) =>
      i === index ? { ...a, modifiers: { ...a.modifiers, [name]: value } } : a
    );
    setFormData({ ...formData, attacks: newAttacks });
  };

  const onCustomBonusChange = (value: number | null) => {
    const newAttacks = formData.attacks.map((a, i) =>
      i === index ? { ...a, modifiers: { ...a.modifiers, customBonus: value } } : a
    );
    setFormData({ ...formData, attacks: newAttacks });
  };

  const onCalledShotChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let penalty = 0;
    if (value !== 'none') {
      penalty = -25;
    }
    const newAttacks = formData.attacks.map((a, i) =>
      i === index ? { ...a, modifiers: { ...a.modifiers, calledShot: value, calledShotPenalty: penalty } } : a
    );
    setFormData({ ...formData, attacks: newAttacks });
  };

  const onCalledShotPenaltyChange = (value: number | null) => {
    const newAttacks = formData.attacks.map((a, i) =>
      i === index ? { ...a, modifiers: { ...a.modifiers, calledShotPenalty: value } } : a
    );
    setFormData({ ...formData, attacks: newAttacks });
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={12}>
        <AttackTitle attack={attack} target={target} />
      </Grid>
      <Grid size={12}>
        <SelectPositionalTarget value={positionalTarget} onChange={(e) => handleChange('positionalTarget', e)} />
      </Grid>
      <Grid size={12}>
        <SelectPositionalSource value={positionalSource} onChange={(e) => handleChange('positionalSource', e)} />
      </Grid>
      <Grid size={12}>
        <SelectMeleeCover value={cover} onChange={(e) => handleChange('cover', e)} />
      </Grid>
      <Grid size={12}>
        <SelectRestrictedQuarters value={restrictedQuarters} onChange={(e) => handleChange('restrictedQuarters', e)} />
      </Grid>
      <Grid size={12}>
        <SelectCalledShot value={modifiers.calledShot || ''} onChange={onCalledShotChange} />
      </Grid>
      <Grid size={12}>
        <SelectDodge value={dodge} onChange={(e) => handleChange('dodge', e)} />
      </Grid>
      <Grid size={12}>
        <MeleeAttackDefensiveOptions index={index} formData={formData} setFormData={setFormData} />
      </Grid>
      <Grid size={12}>
        <SelectPace
          value={pace}
          combatOptions={true}
          onChange={(v, p) => {
            const newAttacks = formData.attacks.map((a, i) =>
              i === index ? { ...a, modifiers: { ...a.modifiers, pace: p?.id || '' } } : a
            );
            setFormData({ ...formData, attacks: newAttacks });
          }}
        />
      </Grid>
      <Grid size={12}>
        <MeleeAttackOptions index={index} formData={formData} setFormData={setFormData} />
      </Grid>
      <Grid size={2}>
        <NumericInput
          label={t('custom-bonus')}
          value={customBonus}
          name="customBonus"
          onChange={onCustomBonusChange}
          integer
        />
      </Grid>
      <Grid size={2}>
        {modifiers.calledShot && modifiers.calledShot !== 'none' && (
          <NumericInput
            label={t('called-shot-penalty')}
            value={modifiers.calledShotPenalty || null}
            name="calledShotPenalty"
            onChange={onCalledShotPenaltyChange}
            integer
          />
        )}
      </Grid>
    </Grid>
  );
};

export default MeleeAttackModifiersForm;
