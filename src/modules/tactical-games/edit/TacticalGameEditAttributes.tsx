import React, { Dispatch, FC, SetStateAction } from 'react';
import { Typography, Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { UpdateTacticalGameDto } from '../../api/tactical-games';

const TacticalGameEditAttributes: FC<{
  formData: UpdateTacticalGameDto;
  setFormData: Dispatch<SetStateAction<UpdateTacticalGameDto>>;
}> = ({ formData, setFormData }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('game-info')}
        </Typography>
      </Grid>
      <Grid size={12}>
        <TextField
          label="Description"
          name="description"
          multiline
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          variant="standard"
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default TacticalGameEditAttributes;
