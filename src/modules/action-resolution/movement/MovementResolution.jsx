import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import SelectPace from '../../shared/selects/SelectPace';

const MovementResolution = () => {
  const location = useLocation();
  const params = useParams();
  const [action, setAction] = useState(null);
  const [formData, setFormData] = useState({ pace: '' });

  const handlePaceChange = (value) => {
    setFormData({ ...formData, pace: value });
  };

  useEffect(() => {
    if (location.state && location.state.action) {
      setAction(location.state.action);
      return;
    }
    if (params.id) {
      //TODO read from context or API
    }
  }, [location.state, params.id]);

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

export default MovementResolution;
