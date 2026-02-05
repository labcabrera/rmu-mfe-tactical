import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { CreateTacticalGameDto } from '../../api/tactical-game.dto';
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
          label="Temperature fatigue modifier"
          value={formData.environment.temperatureFatigueModifier}
          onChange={(value) =>
            setFormData({ ...formData, environment: { ...formData.environment, temperatureFatigueModifier: value } })
          }
        />
      </Grid>
      <Grid size={2}>
        <NumericInput
          label="Altitude fatigue modifier"
          value={formData.environment.altitudeFatigueModifier}
          onChange={(value) =>
            setFormData({ ...formData, environment: { ...formData.environment, altitudeFatigueModifier: value } })
          }
        />
      </Grid>
    </Grid>
  );
};

export default TacticalGameCreationAttributes;
