import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Grid, TextField } from '@mui/material';
import { UpdateTacticalGameDto } from '../../api/tactical-games';

const TacticalGameEditAttributes: FC<{
  formData: UpdateTacticalGameDto;
  setFormData: Dispatch<SetStateAction<UpdateTacticalGameDto>>;
}> = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('game-info')}
        </Typography>
      </Grid>

      <Grid size={12}>
        <TextField label="Name" name="name" value={formData.name} onChange={handleChange} variant="standard" fullWidth />
      </Grid>
      <Grid size={12}>
        <TextField
          label="Description"
          name="description"
          multiline
          rows={4}
          value={formData.description}
          onChange={handleChange}
          variant="standard"
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default TacticalGameEditAttributes;
