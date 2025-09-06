import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useError } from '../../../ErrorContext';
import { updateTacticalGame } from '../../api/tactical-games';
import type { TacticalGame, UpdateTacticalGameDto } from '../../api/tactical-games';
import BackButton from '../../shared/buttons/BackButton';
import SaveButton from '../../shared/buttons/SaveButton';

type TacticalGameEditActionsProps = {
  tacticalGame: TacticalGame;
  formData: UpdateTacticalGameDto;
};

const TacticalGameEditActions: FC<TacticalGameEditActionsProps> = ({ tacticalGame, formData }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError } = useError();

  if (!tacticalGame) {
    return <p>Loading...</p>;
  }

  const handleSaveButtonClick = async () => {
    updateTacticalGame(tacticalGame.id, formData)
      .then((data) => {
        navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: data } });
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  const handleBackButtonClick = () => {
    navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
    return;
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link color="inherit" href="/tactical">
          {t('tactical-games')}
        </Link>
        <Link
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
  );
};

export default TacticalGameEditActions;
