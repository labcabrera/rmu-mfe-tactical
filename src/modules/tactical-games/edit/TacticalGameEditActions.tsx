import React, { FC } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Link, Breadcrumbs, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateTacticalGame } from '../../api/tactical-games';
import type { TacticalGame, UpdateTacticalGameDto } from '../../api/tactical-games';
import BackButton from '../../shared/buttons/BackButton';
import CancelButton from '../../shared/buttons/CancelButton';
import SaveButton from '../../shared/buttons/SaveButton';

const TacticalGameEditActions: FC<{
  tacticalGame: TacticalGame;
  formData: UpdateTacticalGameDto;
}> = ({ tacticalGame, formData }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const onUpdate = async () => {
    updateTacticalGame(tacticalGame.id, formData)
      .then((data) => navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: data } }))
      .catch((err) => showError(err.message));
  };

  const onCancel = () => {
    navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
    return;
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link color="primary" underline="hover" href="/tactical">
          {t('tactical-games')}
        </Link>
        <Link
          color="primary"
          underline="hover"
          component={RouterLink}
          to={`/tactical/view/${tacticalGame.id}`}
          state={{ tacticalGame }}
        >
          {tacticalGame.name}
        </Link>
        <span>{t('edit')}</span>
      </Breadcrumbs>
      <Stack direction="row" spacing={1}>
        <CancelButton onClick={onCancel} />
        <SaveButton onClick={onUpdate} />
      </Stack>
    </Stack>
  );
};

export default TacticalGameEditActions;
