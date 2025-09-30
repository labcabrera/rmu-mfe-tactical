import React, { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Stack, Link } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { createTacticalGame, CreateTacticalGameDto } from '../../api/tactical-games';
import CancelButton from '../../shared/buttons/CancelButton';
import SaveButton from '../../shared/buttons/SaveButton';

const TacticalGameCreationActions: FC<{
  formData: CreateTacticalGameDto;
  isValid?: boolean;
}> = ({ formData, isValid = false }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const onSave = async () => {
    createTacticalGame(formData)
      .then((game) => navigate(`/tactical/games/view/${game.id}`))
      .catch((err) => showError(err.message));
  };

  const onBack = () => {
    navigate(`/tactical/games`);
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="primary" underline="hover" href="/">
            {t('home')}
          </Link>
          <Link component={RouterLink} to="/tactical/games" color="primary" underline="hover">
            {t('tactical')}
          </Link>
          <Link component={RouterLink} to="/tactical/games" color="primary" underline="hover">
            {t('games')}
          </Link>
          <span>{t('create')}</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <CancelButton onClick={onBack} />
        <SaveButton onClick={onSave} disabled={!isValid} />
      </Stack>
    </Stack>
  );
};

export default TacticalGameCreationActions;
