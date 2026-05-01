import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { NumericInput, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRoundAlert } from '../../api/actor-rounds.dto';

export default function BreakageForm({ alert, onChange }: { alert: ActorRoundAlert; onChange: (alert: any) => void }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<any>({ roll: undefined });

  return (
    <Grid container spacing={1}>
      <Grid size={2}>
        <NumericInput
          label={t('breakage-roll')}
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
}
