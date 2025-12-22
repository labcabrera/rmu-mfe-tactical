import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack } from '@mui/material';
import { t } from 'i18next';
import AddButton from '../../shared/buttons/AddButton';

const TacticalGameListActions: React.FC = () => {
  const navigate = useNavigate();

  const onNewTacticalGame = async () => {
    navigate('/tactical/games/create');
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="primary" underline="hover" href="/">
            {t('home')}
          </Link>
          <Link component={RouterLink} color="primary" underline="hover" to="/tactical">
            {t('tactical')}
          </Link>
          <span>{t('games')}</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <AddButton onClick={onNewTacticalGame} />
      </Stack>
    </Stack>
  );
};

export default TacticalGameListActions;
