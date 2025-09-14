import React, { FC, useContext } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { AttackDto } from '../../../api/actions';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import NumericReadonlyInput from '../../../shared/inputs/NumericReadonlyInput';
import ResolveAttackInfo from './ResolveAttackInfo';

const ResolveAttackFormModifiers: FC<{
  formData: AttackDto;
  setFormData: (data: AttackDto) => void;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const { actorRounds } = useContext(CombatContext);

  if (!formData || !formData.attacks || formData.attacks.length <= index) return <div>Loading...</div>;

  const parries = formData.attacks?.[index]?.parries || [];

  const getActorName = (id: string) => {
    return actorRounds.find((a) => a.actorId === id)?.actorName || '';
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <ResolveAttackInfo attack={formData.attacks[index]} />
      <Grid size={12}></Grid>
      {parries && parries.length > 0 && (
        <>
          {parries.map((parry, index) => (
            <React.Fragment key={index}>
              <Grid size={2}>
                <TextField label={t('defending-with')} value={t(getActorName(parry.parryActorId))} name="parryActorId" variant="standard" />
              </Grid>
              <Grid size={2}>
                <TextField label={t('parry-type')} value={t(parry.parryType)} name="parryType" variant="standard" />
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
