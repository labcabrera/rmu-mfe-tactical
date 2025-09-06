import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import { UpdateTacticalGameDto } from '../../api/tactical-games';

type TacticalGameEditAttributesProps = {
  formData: UpdateTacticalGameDto;
  setFormData: (data: UpdateTacticalGameDto) => void;
};

const TacticalGameEditAttributes: React.FC<TacticalGameEditAttributesProps> = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
