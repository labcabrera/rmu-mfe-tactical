import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import { CategorySeparator, NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclaration } from '../../../api/action.dto';

const ResolveAttackFormModifiers: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, setFormData }) => {
  const { actorRounds } = useContext(CombatContext)!;

  if (!formData || !formData.attacks) return <div>Loading...</div>;

  const getActorName = (id: string) => {
    return actorRounds!.find((a) => a.actorId === id)?.actorName || '';
  };

  return (
    <Grid container spacing={1}>
      {formData.parries && (
        <>
          {formData.parries.map((parry, index) => (
            <Fragment key={index}>
              <Grid size={12}>
                <CategorySeparator text={t('parries')} />
              </Grid>
              <Grid size={2}>
                <Stack direction={'column'}>
                  <Typography>{t(getActorName(parry.actorId))}</Typography>
                  <Typography variant="body2" color="secondary">
                    {t('defending-with')}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={2}>
                <Stack direction={'column'}>
                  <Typography>{t(parry.parryType || '')}</Typography>
                  <Typography variant="body2" color="secondary">
                    {t('parry-type')}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={2}>
                <Stack direction={'column'}>
                  <Typography>{parry.parryAvailable}</Typography>
                  <Typography variant="body2" color="secondary">
                    {t('available-parry')}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={2}>
                <NumericInput
                  label={t('parry')}
                  value={parry.parry}
                  name="parry"
                  onChange={(e) => {
                    parry.parry = e!;
                    setFormData({ ...formData, parries: formData.parries });
                  }}
                  integer
                  allowNegatives={false}
                  max={parry.parryAvailable}
                  min={0}
                />
              </Grid>
              <Grid size={12}></Grid>
            </Fragment>
          ))}
        </>
      )}
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
