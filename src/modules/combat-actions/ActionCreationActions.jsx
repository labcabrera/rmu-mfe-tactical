import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { createAction } from '../api/actions';
import BackButton from '../shared/buttons/BackButton';
import SaveButton from '../shared/buttons/SaveButton';

const TacticalActionCreationActions = ({ game: game, character, formData, isValid = true }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCreateAction = async () => {
    const action = await createAction(formData);
    navigate(`/tactical/combat/${game.id}`);
  };

  const handleBackClick = () => {
    navigate(`/tactical/combat/${game.id}`);
    return;
  };

  if (!game || !formData) {
    return <p>Loading...</p>;
  }

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
          <Link underline="hover" color="inherit" href={`/tactical/view/${game.id}`}>
            {game.name}
          </Link>
          <Link underline="hover" color="inherit" href={`/tactical/characters/edit/${character.id}`}>
            {character.name}
          </Link>
          <Typography sx={{ color: 'text.primary' }}>{t(formData.type)} declaration</Typography>
        </Breadcrumbs>

        <div style={{ flexGrow: 1 }} />

        <BackButton onClick={handleBackClick} size={80} />
        <SaveButton onClick={handleCreateAction} size={80} disabled={!isValid} />
      </Stack>
    </div>
  );
};

export default TacticalActionCreationActions;
