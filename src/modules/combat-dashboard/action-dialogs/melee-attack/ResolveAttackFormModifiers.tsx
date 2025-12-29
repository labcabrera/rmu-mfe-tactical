import React, { ChangeEvent, Dispatch, FC, SetStateAction, useContext } from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclaration } from '../../../api/action.dto';
import ToggleButton from '../../../shared/buttons/ToggleButton';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectCalledShot from '../../../shared/selects/SelectCalledShot';
import SelectDodge from '../../../shared/selects/SelectDodge';
import SelectMeleeCover from '../../../shared/selects/SelectMeleeCover';
import SelectPace from '../../../shared/selects/SelectPace';
import SelectPositionalSource from '../../../shared/selects/SelectPositionalSource';
import SelectPositionalTarget from '../../../shared/selects/SelectPositionalTarget';
import SelectRestrictedQuarters from '../../../shared/selects/SelectRestrictedQuarters';
import AttackTitle from './AttackTitle';

const ResolveAttackFormModifiers: FC<{
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
  const disabledDB = modifiers?.disabledDB || false;
  const disabledShield = modifiers?.disabledShield || false;
  const disabledParry = modifiers?.disabledParry || false;
  const higherGround = modifiers?.higherGround || false;
  const stunnedFoe = modifiers?.stunnedFoe || false;
  const surprisedFoe = modifiers?.surprisedFoe || false;
  const ambush = modifiers?.ambush || false;
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
      <Grid size={6}>
        <SelectPositionalTarget value={positionalTarget} onChange={(e) => handleChange('positionalTarget', e)} />
      </Grid>
      <Grid size={6}>
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
        <Stack direction="row" spacing={1}>
          <ToggleButton
            label={'DB'}
            value={!disabledDB}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, disabledDB: !newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
          <ToggleButton
            label={'Shield'}
            value={!disabledShield}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, disabledShield: !newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
          <ToggleButton
            label={'Parry'}
            value={!disabledParry}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, disabledParry: !newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
        </Stack>
      </Grid>
      <Grid size={12}>
        <SelectDodge value={dodge} onChange={(e) => handleChange('dodge', e)} />
      </Grid>
      <Grid size={12}>
        <SelectPace
          value={pace}
          onChange={(v, p) => {
            const newAttacks = formData.attacks.map((a, i) =>
              i === index ? { ...a, modifiers: { ...a.modifiers, pace: p?.id || '' } } : a
            );
            setFormData({ ...formData, attacks: newAttacks });
          }}
        />
      </Grid>
      <Grid size={12}>
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
          Attack modifiers
        </Typography>
        <Stack direction="row" spacing={1}>
          <ToggleButton
            label={'Higher ground'}
            value={higherGround}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, higherGround: newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
          <ToggleButton
            label={'Stunned foe'}
            value={stunnedFoe}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, stunnedFoe: newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
          <ToggleButton
            label={'Surprised foe'}
            value={surprisedFoe}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, surprisedFoe: newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
          <ToggleButton
            label={'Ambush'}
            value={ambush}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, ambush: newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
        </Stack>
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

export default ResolveAttackFormModifiers;
