import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ACTION_BUTTON_SIZE } from '../../constants/ui';
import CloseButton from '../shared/buttons/CloseButton';
import ForgeButton from '../shared/buttons/ForgeButton';

const ForgeItemActions = ({ game, character, formData }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleForgeItemClick = async () => {
    // try {
    //   const requestOptions = {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData),
    //   };
    //   const response = await fetch(`${API_TACTICAL_URL}/characters/${character.id}/items`, requestOptions);
    //   if (response.status === 200) {
    //     navigate(`/tactical/characters/edit/${character.id}?tab=items`);
    //   } else {
    //     const responseBody = await response.json();
    //     throw responseBody.message;
    //   }
    //   return;
    // } catch (error) {
    //   //TODO
    //   console.error(`handleForgeItemClick error ${error}`);
    // }
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
          <Typography sx={{ color: 'text.primary' }}>{game.name}</Typography>
          <Typography sx={{ color: 'text.primary' }}>Characters</Typography>
          <Link underline="hover" color="inherit" href={`/tactical/characters/edit/${character.id}`}>
            {character.name}
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Forge item</Typography>
        </Breadcrumbs>

        <div style={{ flexGrow: 1 }} />

        <CloseButton size={ACTION_BUTTON_SIZE} />
        <ForgeButton onClick={handleForgeItemClick} size={ACTION_BUTTON_SIZE} disabled={!formData.itemTypeId} />
      </Stack>
    </div>
  );
};

export default ForgeItemActions;
