/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BackButton from '../../shared/buttons/BackButton';
import SaveButton from '../../shared/buttons/SaveButton';

const TacticalGameEditActions = ({ tacticalGame }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!tacticalGame) {
    return <p>Loading...</p>;
  }

  const handleSaveButtonClick = async () => {
    //TODO
  };

  const handleBackButtonClick = () => {
    navigate(`/tactical/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
    return;
  };

  return (
    <div className="generic-action-bar">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          width: '100%',
        }}
      >
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/tactical">
            {t('tactical-games')}
          </Link>
          <Link
            underline="hover"
            color="inherit"
            component={RouterLink}
            to={{
              pathname: `/tactical/view/${tacticalGame.id}`,
              state: { tacticalGame },
            }}
          >
            {tacticalGame.name}
          </Link>
          <Typography sx={{ color: 'text.primary' }}>{t('edit')}</Typography>
        </Breadcrumbs>

        <div style={{ flexGrow: 1 }} />

        <BackButton onClick={handleBackButtonClick} />
        <SaveButton onClick={handleSaveButtonClick} />
      </Stack>
    </div>
  );
};

export default TacticalGameEditActions;
