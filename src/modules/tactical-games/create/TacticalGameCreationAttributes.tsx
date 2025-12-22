import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { CreateTacticalGameDto } from '../../api/tactical-games';

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
    </Grid>
  );
};

export default TacticalGameCreationAttributes;
