import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Grid } from '@mui/material';
import { CategorySeparator, KeyValue, NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclaration, CalledShot } from '../../../api/action.dto';
import DialogSelect from '../../../shared/DialogSelect';
import KeyValueDialogSelect from '../../../shared/KeyValueDialogSelect';
import AttackTitle from './AttackTitle';
import { useTranslation } from 'react-i18next';

const POSITIONAL_TARGET_OPTIONS: KeyValue[] = [
  { key: 'none', value: 0 },
  { key: 'flank', value: 15 },
  { key: 'rear', value: 35 },
];
const POSITIONAL_SOURCE_OPTIONS: KeyValue[] = [
  { key: 'none', value: 0 },
  { key: 'to_flank', value: -30 },
  { key: 'to_rear', value: -70 },
];
const MELEE_COVER_OPTIONS: KeyValue[] = [
  { key: 'none', value: 0 },
  { key: 'soft_partial', value: -10 },
  { key: 'soft_half', value: -20 },
  { key: 'soft_full', value: -50 },
  { key: 'hard_partial', value: -20 },
  { key: 'hard_half', value: -40 },
  { key: 'hard_full', value: -100 },
];
const RESTRICTED_QUARTERS_OPTIONS: KeyValue[] = [
  { key: 'none', value: 0 },
  { key: 'close', value: -25 },
  { key: 'cramped', value: -50 },
  { key: 'tight', value: -75 },
  { key: 'confined', value: -100 },
];
const PACES_OPTIONS: KeyValue[] = [
  { key: 'creep', value: 0 },
  { key: 'walk', value: -25 },
  { key: 'jog', value: -50 },
  { key: 'run', value: -75 },
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
  { key: 'yes', value: 30 },
];
const CALLED_SHOT_OPTIONS = ['none', 'head', 'chest', 'abdomen', 'arms', 'legs'];
const DODGE_OPTIONS = ['none', 'passive', 'partial', 'full'];
const ENABLED_OPTIONS = ['enabled', 'disabled'];
const PARRY_TYPE_OPTIONS = ['normal', 'restricted'];

const MeleeAttackModifiersForm: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;

  const attack = formData.attacks?.[index];
  const modifiers = attack?.modifiers;
  const customBonus = modifiers?.customBonus || null;
  const target = actorRounds!.find((actorRound) => actorRound.actorId === modifiers?.targetId);

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

  const onCalledShotChange = (value: CalledShot) => {
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

  const handleDodgeChange = handleTargetChange('dodge');

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <AttackTitle attack={attack} target={target!} />
      </Grid>
      <Grid size={4}>
        <KeyValueDialogSelect
          label={t('Positional source')}
          value={modifiers?.positionalSource}
          options={POSITIONAL_SOURCE_OPTIONS}
          colorDisabledValues={['none']}
          onChange={(e) => handleChange('positionalSource', e!)}
        />
      </Grid>
      <Grid size={4}>
        <KeyValueDialogSelect
          label={t('Restricted quarters')}
          value={modifiers?.restrictedQuarters}
          options={RESTRICTED_QUARTERS_OPTIONS}
          colorDisabledValues={['none']}
          onChange={(e) => handleChange('restrictedQuarters', e!)}
        />
      </Grid>
      <Grid size={4}>
        <KeyValueDialogSelect
          label={t('Pace')}
          value={modifiers?.pace}
          options={PACES_OPTIONS}
          colorDisabledValues={['creep']}
          onChange={(e) => handleChange('pace', e!)}
        />
      </Grid>
      <Grid size={4}>
        <DialogSelect
          label={t('Called shot')}
          value={modifiers?.calledShot}
          options={CALLED_SHOT_OPTIONS}
          colorDisabledValues={['none']}
          colorSuccessValues={['head', 'chest', 'abdomen', 'arms', 'legs']}
          onChange={(e) => onCalledShotChange(e as CalledShot)}
        />
      </Grid>
      <Grid size={4}>
        <KeyValueDialogSelect
          label={t('Higher ground')}
          value={modifiers?.higherGround ? 'yes' : 'no'}
          options={HIGHER_GROUND_OPTIONS}
          colorDisabledValues={['no']}
          onChange={(e) => handleChange('higherGround', e! === 'yes' ? true : false)}
        />
      </Grid>
      <Grid size={4}>
        <KeyValueDialogSelect
          label={t('Prone')}
          value={modifiers?.proneSource ? 'yes' : 'no'}
          options={PRONE_SOURCE_OPTIONS}
          colorDisabledValues={['no']}
          onChange={(e) => handleChange('proneSource', e! === 'yes' ? true : false)}
        />
      </Grid>
      <Grid size={4}>
        <DialogSelect
          label={t('Ambush')}
          value={modifiers?.ambush ? 'enabled' : 'disabled'}
          options={ENABLED_OPTIONS}
          colorDisabledValues={['disabled']}
          colorSuccessValues={['enabled']}
          onChange={(e) => handleChange('ambush', e! === 'enabled' ? true : false)}
        />
      </Grid>

      <Grid size={12}>
        <CategorySeparator text="Target" />
      </Grid>
      <Grid size={4}>
        <KeyValueDialogSelect
          label={t('Positional target')}
          value={modifiers?.positionalTarget}
          options={POSITIONAL_TARGET_OPTIONS}
          colorDisabledValues={['none']}
          onChange={(e) => handleChange('positionalTarget', e!)}
        />
      </Grid>
      <Grid size={4}>
        <KeyValueDialogSelect
          label={t('Cover')}
          value={modifiers?.cover}
          options={MELEE_COVER_OPTIONS}
          colorDisabledValues={['none']}
          onChange={(e) => handleChange('cover', e!)}
        />
      </Grid>
      <Grid size={4}>
        <DialogSelect
          label={t('DB')}
          value={modifiers?.disabledDB ? 'disabled' : 'enabled'}
          options={ENABLED_OPTIONS}
          colorDisabledValues={['enabled']}
          colorErrorValues={['disabled']}
          onChange={(e) => handleChange('disabledDB', e! === 'disabled' ? true : false)}
        />
      </Grid>
      <Grid size={4}>
        <DialogSelect
          label={t('Shield')}
          value={modifiers?.disabledShield ? 'disabled' : 'enabled'}
          options={ENABLED_OPTIONS}
          colorDisabledValues={['enabled']}
          colorErrorValues={['disabled']}
          onChange={(e) => handleChange('disabledShield', e! === 'disabled' ? true : false)}
        />
      </Grid>
      <Grid size={4}>
        <DialogSelect
          label={t('Parry')}
          value={modifiers?.disabledParry ? 'disabled' : 'enabled'}
          options={ENABLED_OPTIONS}
          colorDisabledValues={['enabled']}
          colorErrorValues={['disabled']}
          onChange={(e) => handleChange('disabledParry', e! === 'disabled' ? true : false)}
        />
      </Grid>
      <Grid size={4}>
        <DialogSelect
          label={t('Parry type')}
          value={modifiers?.restrictedParry ? 'restricted' : 'normal'}
          options={PARRY_TYPE_OPTIONS}
          colorDisabledValues={['normal']}
          colorErrorValues={['restricted']}
          onChange={(e) => handleChange('restrictedParry', e! === 'restricted' ? true : false)}
        />
      </Grid>
      <Grid size={4}>
        <DialogSelect
          label={t('Dodge')}
          value={modifiers?.dodge}
          options={DODGE_OPTIONS}
          colorDisabledValues={['none']}
          colorSuccessValues={['passive', 'partial', 'full']}
          onChange={(e) => handleDodgeChange(e!)}
        />
      </Grid>
      <Grid size={4}>
        <KeyValueDialogSelect
          label={t('Stunned')}
          value={modifiers?.stunnedFoe ? 'yes' : 'no'}
          options={STUNNED_TARGET_OPTIONS}
          colorDisabledValues={['no']}
          onChange={(e) => handleChange('stunnedFoe', e! === 'yes' ? true : false)}
        />
      </Grid>
      <Grid size={4}>
        <KeyValueDialogSelect
          label={t('Surprised')}
          value={modifiers?.surprisedFoe ? 'yes' : 'no'}
          options={SURPRISED_TARGET_OPTIONS}
          colorDisabledValues={['no']}
          onChange={(e) => handleChange('surprisedFoe', e! === 'yes' ? true : false)}
        />
      </Grid>
      <Grid size={4}>
        <KeyValueDialogSelect
          label={t('Prone')}
          value={modifiers?.proneTarget ? 'yes' : 'no'}
          options={PRONE_TARGET_OPTIONS}
          colorDisabledValues={['no']}
          onChange={(e) => handleChange('proneTarget', e! === 'yes' ? true : false)}
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
      <Grid size={2}>
        {modifiers.calledShot && modifiers.calledShot !== 'none' && (
          <NumericInput
            label={t('Called shot penalty')}
            value={modifiers.calledShotPenalty || null}
            onChange={onCalledShotPenaltyChange}
            integer
          />
        )}
      </Grid>
    </Grid>
  );
};

export default MeleeAttackModifiersForm;
