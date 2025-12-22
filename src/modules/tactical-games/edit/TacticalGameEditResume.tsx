import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { UpdateTacticalGameDto } from '../../api/tactical-games';

const TacticalGameEditResume: FC<{
  formData: UpdateTacticalGameDto;
  setFormData: Dispatch<SetStateAction<UpdateTacticalGameDto>>;
}> = ({ formData, setFormData }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          label={t('name')}
          variant="standard"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          error={!formData.name || formData.name.trim() === ''}
        />
      </Grid>
    </Grid>
  );
};

export default TacticalGameEditResume;
