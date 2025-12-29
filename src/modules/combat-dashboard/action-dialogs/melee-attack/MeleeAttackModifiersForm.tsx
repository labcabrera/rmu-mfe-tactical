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
    setFormData((prev) => {
      const newAttacks = prev.attacks.map((a, i) =>
        i === index ? { ...a, modifiers: { ...a.modifiers, [name]: value } } : a
      );
      return { ...prev, attacks: newAttacks } as AttackDeclaration;
    });
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

  /**
   * In the event of multiple attacks with the same target, propagate the changes to all attacks.
   * @param fieldName
   * @returns
   */
  const handleTargetChange = (fieldName: string) => (value: string | boolean) => {
    const currentTargetId = modifiers?.targetId;
    if (!currentTargetId) {
      handleChange(fieldName, value);
      return;
    }
    setFormData((prev) => {
      const newAttacks = prev.attacks?.map((a) =>
        a.modifiers?.targetId === currentTargetId ? { ...a, modifiers: { ...a.modifiers, [fieldName]: value } } : a
      );
      return { ...prev, attacks: newAttacks } as AttackDeclaration;
    });
  };

  /**
   * Create a handler that applies the change to ALL attacks regardless of targetId
   */
  const handleSharedChange = (fieldName: string) => (value: string | boolean) => {
    setFormData((prev) => {
      const newAttacks = prev.attacks?.map((a) => ({ ...a, modifiers: { ...a.modifiers, [fieldName]: value } }));
      return { ...prev, attacks: newAttacks } as AttackDeclaration;
    });
  };

  const handlePositionalTarget = handleTargetChange('positionalTarget');
  const handlePositionalSource = handleTargetChange('positionalSource');
  const handleCoverChange = handleTargetChange('cover');
  const handleDodgeChange = handleTargetChange('dodge');

  const handleRestrictedQuartersChange = handleSharedChange('restrictedQuarters');
  const handlePaceChange = handleSharedChange('pace');

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={12}>
        <AttackTitle attack={attack} target={target} />
      </Grid>
      <Grid size={12}>
        <SelectPositionalTarget value={positionalTarget} onChange={(e) => handlePositionalTarget(e)} />
      </Grid>
      <Grid size={12}>
        <SelectPositionalSource value={positionalSource} onChange={(e) => handlePositionalSource(e)} />
      </Grid>
      <Grid size={12}>
        <SelectMeleeCover value={cover} onChange={(e) => handleCoverChange(e)} />
      </Grid>
      <Grid size={12}>
        <SelectRestrictedQuarters value={restrictedQuarters} onChange={(e) => handleRestrictedQuartersChange(e)} />
      </Grid>
      <Grid size={12}>
        <SelectCalledShot value={modifiers.calledShot || ''} onChange={onCalledShotChange} />
      </Grid>
      <Grid size={12}>
        <SelectDodge value={dodge} onChange={(e) => handleDodgeChange(e)} />
      </Grid>
      <Grid size={12}>
        <SelectPace value={pace} combatOptions={true} onChange={(v, p) => handlePaceChange(p?.id || v)} />
      </Grid>
      <Grid size={12}>
        <MeleeAttackDefensiveOptions index={index} formData={formData} setFormData={setFormData} />
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
