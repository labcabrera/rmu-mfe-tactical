import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { IconButton } from '@mui/material';

const PlayButton: FC<{
  onClick?: () => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => {
  const { t } = useTranslation();
  return (
    <IconButton onClick={onClick} aria-label={t('play')} disabled={disabled} size="large" color="primary">
      <PlayCircleIcon fontSize="inherit" />
    </IconButton>
  );
};

export default PlayButton;
