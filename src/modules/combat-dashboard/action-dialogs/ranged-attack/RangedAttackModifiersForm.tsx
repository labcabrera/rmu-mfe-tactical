import React, { ChangeEvent, Dispatch, FC, SetStateAction, useContext } from 'react';
import { Grid, Typography } from '@mui/material';
import { KeyValue, NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { Action, AttackDeclaration, CalledShot } from '../../../api/action.dto';
import { ActorRoundAttack } from '../../../api/actor-rounds.dto';
import DialogSelect from '../../../shared/DialogSelect';
import KeyValueDialogSelect from '../../../shared/KeyValueDialogSelect';
import SelectAttackRange from '../../../shared/selects/SelectAttackRange';
import SelectCalledShot from '../../../shared/selects/SelectCalledShot';
import SelectDodge from '../../../shared/selects/SelectDodge';
import AttackTitle from '../melee-attack/AttackTitle';
import RangedAttackDefenseOptions from './RangedAttackDefenseOptions';
import RangedAttackOptionsForm from './RangedAttackOptionsForm';

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

const CALLED_SHOT_OPTIONS: CalledShot[] = ['none', 'head', 'chest', 'abdomen', 'arms', 'legs'];
const DODGE_OPTIONS = ['none', 'passive', 'partial', 'full'];

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
  const dodge = modifiers?.dodge || '';
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
          options={COVER_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <KeyValueDialogSelect
          value={formDataAttack.modifiers.restrictedQuarters}
          onChange={(e) => handleChange('restrictedQuarters', e!)}
          label={'Restricted Quarters'}
          options={RESTRICTED_QUARTER_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <DialogSelect
          value={formDataAttack.modifiers.calledShot}
          onChange={(e) => handleChange('calledShot', e!)}
          label={'Called shot'}
          options={CALLED_SHOT_OPTIONS}
        />
      </Grid>
      <Grid size={3}>
        <DialogSelect
          value={formDataAttack.modifiers.dodge}
          onChange={(e) => handleChange('dodge', e!)}
          label={'Dodge'}
          options={DODGE_OPTIONS}
        />
      </Grid>
      <Grid size={12}></Grid>

      <Grid size={2}>
        <Typography color="secondary">{t('dodge')}</Typography>
      </Grid>
      <Grid size={10}>
        <SelectDodge value={dodge} onChange={(e) => handleChange('dodge', e)} />
      </Grid>
      <Grid size={2}>
        <Typography color="secondary">{t('defense-options')}</Typography>
      </Grid>
      <Grid size={10}>
        <RangedAttackDefenseOptions formData={formData} setFormData={setFormData} index={0} />
      </Grid>
      <Grid size={2}>
        <Typography color="secondary">{t('attack-options')}</Typography>
      </Grid>
      <Grid size={10}>
        <RangedAttackOptionsForm formData={formData} setFormData={setFormData} index={0} />
      </Grid>
      <Grid size={2}>
        <Typography color="secondary">{t('custom-bonus')}</Typography>
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
      {modifiers.calledShot && modifiers.calledShot !== 'none' && (
        <Grid size={2}>
          <NumericInput
            label={t('called-shot-penalty')}
            value={modifiers.calledShotPenalty || null}
            name="calledShotPenalty"
            onChange={onCalledShotPenaltyChange}
            integer
          />
        </Grid>
      )}
      {/* <Grid size={12}>
        <Button variant="contained" color="success" disabled={!isValidForm()} onClick={prepare}>
          {t('prepare')}
        </Button>
      </Grid> */}
    </Grid>
  );
};

export default RangedAttackModifiersForm;
