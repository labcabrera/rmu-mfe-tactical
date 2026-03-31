import React, { FC } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Link, Breadcrumbs, Stack } from '@mui/material';
import { CancelButton, SaveButton } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateTacticalGame } from '../../api/tactical-game';
import { TacticalGame, UpdateTacticalGameDto } from '../../api/tactical-game.dto';

const TacticalGameEditActions: FC<{
  tacticalGame: TacticalGame;
  formData: UpdateTacticalGameDto;
  isValid: boolean;
}> = ({ tacticalGame, formData, isValid }) => {
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
        <Link color="primary" underline="hover" href="/">
          {t('home')}
        </Link>
        <Link component={RouterLink} color="primary" underline="hover" to="/tactical">
          {t('tactical')}
        </Link>
        <Link component={RouterLink} color="primary" underline="hover" to="/tactical/games">
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
        <SaveButton onClick={onUpdate} disabled={!isValid} />
      </Stack>
    </Stack>
  );
};

export default TacticalGameEditActions;
