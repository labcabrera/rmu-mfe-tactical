import React, { ChangeEvent, Dispatch, FC, SetStateAction, useContext } from 'react';
import { Button, Grid } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclaration } from '../../../api/action.dto';
import { ActorRoundAttack } from '../../../api/actor-rounds.dto';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectAttackRange from '../../../shared/selects/SelectAttackRange';
import SelectCalledShot from '../../../shared/selects/SelectCalledShot';
import SelectDodge from '../../../shared/selects/SelectDodge';
import SelectRangedCover from '../../../shared/selects/SelectRangedCover';
import SelectRestrictedQuarters from '../../../shared/selects/SelectRestrictedQuarters';
import AttackTitle from '../melee-attack/AttackTitle';
import RangedAttackDefenseOptions from './RangedAttackDefenseOptions';
import RangedAttackOptionsForm from './RangedAttackOptionsForm';

const RangedAttackModifiersForm: FC<{
  attack: ActorRoundAttack;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
}> = ({ attack, formData, setFormData, index }) => {
  const { actorRounds } = useContext(CombatContext);

  const formDataAttack = formData.attacks?.[index];
  const modifiers = formDataAttack?.modifiers;
  const customBonus = modifiers?.customBonus || null;
  const restrictedQuarters = modifiers?.restrictedQuarters || '';
  const dodge = modifiers?.dodge || '';
  const target = actorRounds.find((actorRound) => actorRound.actorId === modifiers?.targetId);

  const isValidForm = () => {
    if (target === undefined) return false;
    if (!modifiers) return false;
    if (modifiers.range === null || modifiers.range === undefined) return false;
    return true;
  };

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
      <Grid size={12}>
        <SelectAttackRange attack={attack} value={modifiers.range || null} onChange={onRangeChange} readOnly={false} />
      </Grid>
      <Grid size={12}>
        <SelectRestrictedQuarters value={restrictedQuarters} onChange={(e) => handleChange('restrictedQuarters', e)} />
      </Grid>
      <Grid size={12}>
        <SelectRangedCover value={formDataAttack?.modifiers?.cover || ''} onChange={(e) => handleChange('cover', e)} />
      </Grid>
      <Grid size={12}>
        <SelectCalledShot value={modifiers.calledShot || ''} onChange={onCalledShotChange} target={target} />
      </Grid>
      <Grid size={12}>
        <SelectDodge value={dodge} onChange={(e) => handleChange('dodge', e)} />
      </Grid>
      <Grid size={12}>
        <RangedAttackDefenseOptions formData={formData} setFormData={setFormData} index={0} />
      </Grid>
      <Grid size={12}>
        <RangedAttackOptionsForm formData={formData} setFormData={setFormData} index={0} />
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
      <Grid size={12}>
        <Button
          variant="contained"
          color="success"
          disabled={!isValidForm()}
          onClick={() => setFormData({ ...formData, attacks: [] })}
        >
          {t('prepare')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default RangedAttackModifiersForm;
