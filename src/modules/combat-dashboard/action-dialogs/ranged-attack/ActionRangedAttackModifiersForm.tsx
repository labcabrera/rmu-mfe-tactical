import React, { ChangeEvent, Dispatch, FC, SetStateAction, useContext } from 'react';
import { FormControlLabel, Grid, Switch } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclaration } from '../../../api/action.dto';
import { ActorRoundAttack } from '../../../api/actor-rounds.dto';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectCalledShot from '../../../shared/selects/SelectCalledShot';
import SelectCover from '../../../shared/selects/SelectCover';
import SelectDodge from '../../../shared/selects/SelectDodge';
import SelectPositionalSource from '../../../shared/selects/SelectPositionalSource';
import SelectPositionalTarget from '../../../shared/selects/SelectPositionalTarget';
import SelectRestrictedQuarters from '../../../shared/selects/SelectRestrictedQuarters';
import AttackTitle from '../attack/AttackTitle';
import ActionRangeSelector from './ActionRangeSelector';

const ActionRangedAttackModifiersForm: FC<{
  attack: ActorRoundAttack;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
}> = ({ attack, formData, setFormData, index }) => {
  const { actorRounds } = useContext(CombatContext);

  const formDataAttack = formData.attacks?.[index];
  const modifiers = formDataAttack?.modifiers;
  const customBonus = modifiers?.customBonus || null;
  const cover = modifiers?.cover || '';
  const restrictedQuarters = modifiers?.restrictedQuarters || '';
  const positionalSource = modifiers?.positionalSource || '';
  const positionalTarget = modifiers?.positionalTarget || '';
  const dodge = modifiers?.dodge || '';
  const range = modifiers?.range || null;
  const disabledDB = modifiers?.disabledDB || false;
  const disabledShield = modifiers?.disabledShield || false;
  const disabledParry = modifiers?.disabledParry || false;
  const target = actorRounds.find((actorRound) => actorRound.actorId === modifiers?.targetId);

  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    handleChange(e.target.name, e.target.value);

  const handleSwitchChangeEvent = (e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.name, e.target.checked);

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

  const onRangeChange = (value: number | null) => {
    const newAttacks = formData.attacks.map((a, i) =>
      i === index ? { ...a, modifiers: { ...a.modifiers, range: value } } : a
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
        <AttackTitle attack={formDataAttack} target={target} />
      </Grid>
      <Grid size={2}>
        <SelectPositionalTarget value={positionalTarget} onChange={handleChangeEvent} />
      </Grid>
      <Grid size={2}>
        <SelectPositionalSource value={positionalSource} onChange={handleChangeEvent} />
      </Grid>
      <Grid size={2}>
        <SelectCover value={cover} onChange={handleChangeEvent} />
      </Grid>
      <Grid size={2}>
        <SelectRestrictedQuarters value={restrictedQuarters} onChange={handleChangeEvent} />
      </Grid>
      <Grid size={2}>
        <SelectCalledShot value={modifiers.calledShot || ''} onChange={onCalledShotChange} />
      </Grid>
      <Grid size={2}>
        <SelectDodge value={dodge} onChange={handleChangeEvent} />
      </Grid>
      <Grid size={2}>
        <NumericInput
          label={t('range')}
          value={range}
          name="range"
          onChange={onRangeChange}
          maxFractionDigits={1}
          allowNegatives={false}
        />
      </Grid>
      <Grid size={12}></Grid>
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
      <Grid size={2}>
        <FormControlLabel
          control={<Switch checked={!!disabledDB} name="disabledDB" onChange={handleSwitchChangeEvent} />}
          label="Disabled DB"
        />
      </Grid>
      <Grid size={2}>
        <FormControlLabel
          control={<Switch checked={!!disabledShield} name="disabledShield" onChange={handleSwitchChangeEvent} />}
          label="Disabled Shield"
        />
      </Grid>
      <Grid size={2}>
        <FormControlLabel
          control={<Switch checked={!!disabledParry} name="disabledParry" onChange={handleSwitchChangeEvent} />}
          label="Disabled Parry"
        />
      </Grid>
      <Grid size={12}>
        <ActionRangeSelector
          attack={attack}
          value={modifiers.range || null}
          onChange={onRangeChange}
          readOnly={false}
        />
      </Grid>
    </Grid>
  );
};

export default ActionRangedAttackModifiersForm;
