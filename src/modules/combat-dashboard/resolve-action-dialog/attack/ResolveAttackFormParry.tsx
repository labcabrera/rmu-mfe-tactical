import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclaration } from '../../../api/action.dto';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import NumericReadonlyInput from '../../../shared/inputs/NumericReadonlyInput';
import ResolveAttackInfo from './ResolveAttackInfo';

const ResolveAttackFormModifiers: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const { actorRounds } = useContext(CombatContext);

  if (!formData || !formData.attacks) return <div>Loading...</div>;

  const getActorName = (id: string) => {
    return actorRounds.find((a) => a.actorId === id)?.actorName || '';
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <ResolveAttackInfo attack={formData.attacks[index]} />
      <Grid size={12}></Grid>
      {formData.parries && (
        <>
          {formData.parries.map((parry, index) => (
            <React.Fragment key={index}>
              <Grid size={2}>
                <TextField label={t('defending-with')} value={t(getActorName(parry.actorId))} name="actorId" variant="standard" />
              </Grid>
              <Grid size={2}>
                <TextField label={t('parry-type')} value={t(parry.parryType)} name="parryType" variant="standard" />
              </Grid>
              <Grid size={2}>
                <TextField label={t('attack-name')} value={t(parry.targetAttackName)} name="targetAttackName" variant="standard" />
              </Grid>
              <Grid size={2}>
                <NumericReadonlyInput label={t('available-parry')} value={parry.parryAvailable} name="availableParry" />
              </Grid>
              <Grid size={2}>
                <NumericInput
                  label={t('parry')}
                  value={parry.parry}
                  name="parry"
                  onChange={(e) => {
                    parry.parry = e;
                    setFormData({ ...formData, parries: formData.parries });
                  }}
                  integer
                  allowNegatives={false}
                  max={parry.parryAvailable}
                  min={0}
                />
              </Grid>
              <Grid size={6}></Grid>
            </React.Fragment>
          ))}
        </>
      )}
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
