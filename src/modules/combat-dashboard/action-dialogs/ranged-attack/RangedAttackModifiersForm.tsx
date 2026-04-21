import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Grid, Typography } from '@mui/material';
import { CategorySeparator, KeyValue, NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { Action, AttackDeclaration, CalledShot } from '../../../api/action.dto';
import { ActorRoundAttack } from '../../../api/actor-rounds.dto';
import DialogSelect from '../../../shared/DialogSelect';
import KeyValueDialogSelect from '../../../shared/KeyValueDialogSelect';
import SelectAttackRange from '../../../shared/selects/SelectAttackRange';
import AttackTitle from '../melee-attack/AttackTitle';

const COVER_OPTIONS: KeyValue[] = [
  { key: 'none', value: 0 },
  { key: 'soft_partial', value: -20 },
  { key: 'soft_half', value: -40 },
  { key: 'soft_full', value: -100 },
  { key: 'hard_partial', value: -40 },
  { key: 'hard_half', value: -80 },
  { key: 'hard_full', value: -200 },
];
const RESTRICTED_QUARTER_OPTIONS: KeyValue[] = [
  { key: 'none', value: 0 },
  { key: 'close', value: -25 },
  { key: 'cramped', value: -50 },
  { key: 'tight', value: -75 },
  { key: 'confined', value: -100 },
];
const HIGHER_GROUND_OPTIONS: KeyValue[] = [
  { key: 'no', value: 0 },
  { key: 'yes', value: 10 },
];
const STUNNED_TARGET_OPTIONS: KeyValue[] = [
  { key: 'no', value: 0 },
  { key: 'yes', value: 20 },
];
const SURPRISED_TARGET_OPTIONS: KeyValue[] = [
  { key: 'no', value: 0 },
  { key: 'yes', value: 25 },
];
const PRONE_SOURCE_OPTIONS: KeyValue[] = [
  { key: 'no', value: 0 },
  { key: 'yes', value: -50 },
];
const PRONE_TARGET_OPTIONS: KeyValue[] = [
  { key: 'no', value: 0 },
  { key: 'yes', value: -30 },
];
const SOURCE_IN_MELEE_OPTIONS: KeyValue[] = [
  { key: 'no', value: 0 },
  { key: 'yes', value: -20 },
];
const CALLED_SHOT_OPTIONS: CalledShot[] = ['none', 'head', 'chest', 'abdomen', 'arms', 'legs'];
const DODGE_OPTIONS = ['none', 'passive', 'partial', 'full'];
const ENABLED_OPTIONS = ['enabled', 'disabled'];

const RangedAttackModifiersForm: FC<{
  action: Action;
  attack: ActorRoundAttack;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
}> = ({ attack, formData, setFormData, index }) => {
  const { actorRounds } = useContext(CombatContext)!;

  const formDataAttack = formData.attacks?.[index];
  const modifiers = formDataAttack?.modifiers;
  const customBonus = modifiers?.customBonus || null;
  const target = actorRounds!.find((actorRound) => actorRound.actorId === modifiers?.targetId);

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

  const onCalledShotChange = (value: CalledShot) => {
    // const value = e.target.value;
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
    <Grid container spacing={1}>
      {target && (
        <Grid size={12}>
          <AttackTitle attack={formDataAttack} target={target} />
        </Grid>
      )}
      <Grid size={2}>
        <Typography color="secondary">{t('range')}</Typography>
      </Grid>
      <Grid size={10}>
        <SelectAttackRange attack={attack} value={modifiers.range || null} onChange={onRangeChange} readOnly={false} />
      </Grid>
      <Grid size={3}>
        <KeyValueDialogSelect
          value={formDataAttack.modifiers.cover}
          onChange={(e) => handleChange('cover', e!)}
          label={'Cover'}
          colorDisabledValues={['none']}
          options={COVER_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <KeyValueDialogSelect
          value={formDataAttack.modifiers.restrictedQuarters}
          onChange={(e) => handleChange('restrictedQuarters', e!)}
          label={'Restricted Quarters'}
          colorDisabledValues={['none']}
          options={RESTRICTED_QUARTER_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <DialogSelect
          value={formDataAttack.modifiers.calledShot}
          onChange={(e) => onCalledShotChange(e as CalledShot)}
          label={'Called shot'}
          colorDisabledValues={['none']}
          colorSuccessValues={['head', 'chest', 'abdomen', 'arms', 'legs']}
          options={CALLED_SHOT_OPTIONS}
        />
      </Grid>

      <Grid size={3}>
        <KeyValueDialogSelect
          value={formDataAttack.modifiers.higherGround ? 'yes' : 'no'}
          onChange={(e) => handleChange('higherGround', e === 'yes')}
          label={'Higher ground'}
          colorDisabledValues={['no']}
          options={HIGHER_GROUND_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <KeyValueDialogSelect
          value={formDataAttack.modifiers.proneSource ? 'yes' : 'no'}
          onChange={(e) => handleChange('proneSource', e === 'yes')}
          label={'Prone'}
          colorDisabledValues={['no']}
          options={PRONE_SOURCE_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <KeyValueDialogSelect
          value={formDataAttack.modifiers.attackerInMelee ? 'yes' : 'no'}
          onChange={(e) => handleChange('attackerInMelee', e === 'yes')}
          label={'In melee'}
          colorDisabledValues={['no']}
          options={SOURCE_IN_MELEE_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <DialogSelect
          value={formDataAttack.modifiers.ambush ? 'enabled' : 'disabled'}
          onChange={(e) => handleChange('ambush', e === 'enabled')}
          label={'Ambush'}
          colorDisabledValues={['disabled']}
          colorSuccessValues={['enabled']}
          options={ENABLED_OPTIONS}
        />
      </Grid>

      <Grid size={12}>
        <CategorySeparator text={t('Target')} />
      </Grid>
      <Grid size={3}>
        <KeyValueDialogSelect
          value={formDataAttack.modifiers.stunnedFoe ? 'yes' : 'no'}
          onChange={(e) => handleChange('stunnedFoe', e === 'yes')}
          label={'Stunned'}
          colorDisabledValues={['no']}
          options={STUNNED_TARGET_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <DialogSelect
          value={formDataAttack.modifiers.disabledDB ? 'disabled' : 'enabled'}
          onChange={(e) => handleChange('disabledDB', e === 'disabled')}
          label={'DB'}
          colorDisabledValues={['enabled']}
          colorSuccessValues={['disabled']}
          options={ENABLED_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <DialogSelect
          value={formDataAttack.modifiers.disabledShield ? 'disabled' : 'enabled'}
          onChange={(e) => handleChange('disabledShield', e === 'disabled')}
          label={'Shield'}
          colorDisabledValues={['enabled']}
          colorSuccessValues={['disabled']}
          options={ENABLED_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <DialogSelect
          value={formDataAttack.modifiers.dodge}
          onChange={(e) => handleChange('dodge', e!)}
          label={'Dodge'}
          colorDisabledValues={['none']}
          colorErrorValues={['passive', 'partial', 'full']}
          options={DODGE_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <KeyValueDialogSelect
          value={formDataAttack.modifiers.surprisedFoe ? 'yes' : 'no'}
          onChange={(e) => handleChange('surprisedFoe', e === 'yes')}
          label={'Surprised'}
          colorDisabledValues={['no']}
          options={SURPRISED_TARGET_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <KeyValueDialogSelect
          value={formDataAttack.modifiers.proneTarget ? 'yes' : 'no'}
          onChange={(e) => handleChange('proneTarget', e === 'yes')}
          label={'Prone'}
          colorDisabledValues={['no']}
          options={PRONE_TARGET_OPTIONS}
        />
      </Grid>

      <Grid size={12}></Grid>

      <Grid size={2}>
        <NumericInput
          label={t('Custom bonus')}
          value={customBonus}
          name="customBonus"
          onChange={onCustomBonusChange}
          integer
        />
      </Grid>
      {modifiers.calledShot && modifiers.calledShot !== 'none' && (
        <Grid size={2}>
          <NumericInput
            label={t('Called shot penalty')}
            value={modifiers.calledShotPenalty || null}
            name="calledShotPenalty"
            onChange={onCalledShotPenaltyChange}
            integer
          />
        </Grid>
      )}
    </Grid>
  );
};

export default RangedAttackModifiersForm;
