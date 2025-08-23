import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import TacticalGameEditActions from './TacticalGameEditActions';

const TacticalGameEdit = ({}) => {
  const debugMode = true;

  const [formData, setFormData] = useState({});

  const location = useLocation();
  const { gameId } = useParams();

  const [tacticalGame, setTacticalGame] = useState();

  const fetchTacticalGame = async (gameId) => {
    const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${gameId}`, { method: 'GET' });
    const responseBody = await response.json();
    setTacticalGame(responseBody);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    if (location.state && location.state.tacticalGame) {
      console.log(`TacticalGameView.useEffect: resolved tacticalGame from state`);
      setTacticalGame(location.state.tacticalGame);
    } else {
      console.log(`TacticalGameView.useEffect: fetch tacticalGame ${gameId} from API`);
      fetchTacticalGame(gameId);
    }
  }, [location.state]);

  useEffect(() => {
    console.log(`TacticalGameView.useEffect: set formData`);
    setFormData({
      name: tacticalGame?.name,
      description: tacticalGame?.description,
    });
  }, [tacticalGame]);

  if (!tacticalGame) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <TacticalGameEditActions tacticalGame={tacticalGame} formData={formData} />
      <div className="generic-main-content">
        <Grid container spacing={2}>
          <Grid item size={12}>
            <TextField fullWidth label="Name" name="name" value={formData.name || ''} onChange={handleChange} />
          </Grid>
          <Grid item size={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default TacticalGameEdit;
