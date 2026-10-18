import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { NumericInput, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRoundAlert } from '../../api/actor-rounds.dto';
import { isDevelopment } from '../../services/action-service';

export default function BreakageForm({
  alert,
}: {
  alert: ActorRoundAlert;
  onChange?: (alert: ActorRoundAlert) => void;
}) {
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
      {isDevelopment && (
        <Grid size={12}>
          <TechnicalInfo>
            <pre>{JSON.stringify({ formData, alert }, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      )}
    </Grid>
  );
}
