/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useError } from '../../../ErrorContext';
import { createTacticalGame } from '../../api/tactical-games';
import BackButton from '../../shared/buttons/BackButton';
import SaveButton from '../../shared/buttons/SaveButton';

const TacticalGameCreationActions = ({ formData, isValid = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError } = useError();

  const handleSave = async () => {
    createTacticalGame(formData)
      .then((game) => {
        navigate(`/tactical/games/view/${game.id}`);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const handleBack = () => {
    navigate(`/tactical/games`);
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">
            {t('home')}
          </Link>
          <Link component={RouterLink} to="/tactical/games" color="inherit">
            {t('tactical')}
          </Link>
          <Link component={RouterLink} to="/tactical/games" color="inherit">
            {t('games')}
          </Link>
          <span>{t('creation')}</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <BackButton onClick={handleBack} size={80} />
        <SaveButton onClick={handleSave} size={80} disabled={!isValid} />
      </Stack>
    </Stack>
  );
};

export default TacticalGameCreationActions;
