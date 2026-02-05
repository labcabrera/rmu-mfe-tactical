import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { CreateTacticalGameDto } from '../../api/tactical-game';
import { NumericInput } from '../../shared/inputs/NumericInput';

const TacticalGameCreationAttributes: FC<{
  formData: CreateTacticalGameDto;
  setFormData: Dispatch<SetStateAction<CreateTacticalGameDto>>;
}> = ({ formData, setFormData }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          label={t('description')}
          variant="standard"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          multiline
          maxRows={6}
        />
      </Grid>
      <Grid size={2}>
        <NumericInput
          label="Temperature fatigue penalty"
          value={formData.environment.temperatureFatiguePenalty}
          onChange={(value) =>
            setFormData({ ...formData, environment: { ...formData.environment, temperatureFatiguePenalty: value } })
          }
        />
      </Grid>
      <Grid size={2}>
        <NumericInput
          label="Altitude fatigue penalty"
          value={formData.environment.altitudeFatiguePenalty}
          onChange={(value) =>
            setFormData({ ...formData, environment: { ...formData.environment, altitudeFatiguePenalty: value } })
          }
        />
      </Grid>
    </Grid>
  );
};

export default TacticalGameCreationAttributes;
