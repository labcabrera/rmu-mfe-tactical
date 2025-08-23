import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { createTacticalGame } from '../../api/tactical-games';
import BackButton from '../../shared/buttons/BackButton';
import SaveButton from '../../shared/buttons/SaveButton';

const TacticalGameCreationActions = ({ formData, isValid = false }) => {
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      const game = await createTacticalGame(formData);
      navigate(`/tactical/games/view/${game.id}`);
    } catch (error) {
      console.error('Error creating tactical game:', error);
    }
  };

  const handleBackButtonClick = () => {
    navigate(`/tactical/games`);
    return;
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/tactical">
            Tactical
          </Link>
          <span>Games</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <BackButton onClick={handleBackButtonClick} size={80} />
        <SaveButton onClick={handleSave} size={80} disabled={!isValid} />
      </Stack>
    </Stack>
  );
};

export default TacticalGameCreationActions;
