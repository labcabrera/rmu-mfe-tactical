import React, { FC, useState } from 'react';
import { Grid } from '@mui/material';
import { NumericInput, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { ActorRoundAlert } from '../../api/actor-rounds.dto';

type Props = {
  alert: ActorRoundAlert;
};

const BreakageForm: FC<Props> = ({ alert }) => {
  const [formData, setFormData] = useState<any>({ roll: undefined });

  return (
    <Grid container spacing={1}>
      <Grid size={2}>
        <NumericInput
          label={t('Breakage roll')}
          value={formData.roll || null}
          onChange={(e) => setFormData({ ...formData, roll: e })}
        />
      </Grid>
      <Grid size={12}>
        <TechnicalInfo>
          <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
          <pre>Alert: {JSON.stringify(alert, null, 2)}</pre>
        </TechnicalInfo>
      </Grid>
    </Grid>
  );
};

export default BreakageForm;
