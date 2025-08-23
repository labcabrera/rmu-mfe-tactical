import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BackButton from '../../../components/button/BackButton';
import SaveButton from '../../../components/button/SaveButton';

const TacticalGameEditActions = ({ tacticalGame, formData }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!tacticalGame) {
    return <p>Loading...</p>;
  }

  const handleSaveButtonClick = async () => {
    // const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${tacticalGame.id}`, {
    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(formData),
    // });
    // if (response.status == 200) {
    //   const responseBody = await response.json();
    //   navigate(`/tactical/view/${tacticalGame.id}`, { state: { tacticalGame: responseBody } });
    // } else {
    //   //TODO handle error
    // }
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

        <BackButton onClick={handleBackButtonClick} size={ACTION_BUTTON_SIZE} />
        <SaveButton onClick={handleSaveButtonClick} size={ACTION_BUTTON_SIZE} />
      </Stack>
    </div>
  );
};

export default TacticalGameEditActions;
