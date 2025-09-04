/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Grid } from '@mui/material';
import SelectPace from '../../shared/selects/SelectPace';

const ResolveActionDialogMovement = ({ action }) => {
  const [formData, setFormData] = useState({ pace: '' });

  const handlePaceChange = (value) => {
    setFormData({ ...formData, pace: value });
  };

  return (
    <>
      <h2>Movement Resolution</h2>
      <Grid container spacing={2}>
        <Grid size={6}>
          <SelectPace value={formData.pace} onChange={handlePaceChange} />
        </Grid>
      </Grid>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default ResolveActionDialogMovement;
