/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

const TacticalGameEditAttributes = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
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

      <Grid item size={12}>
        <TextField label="Name" name="name" value={formData.name} onChange={handleChange} variant="standard" fullWidth />
      </Grid>
      <Grid item size={12}>
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
