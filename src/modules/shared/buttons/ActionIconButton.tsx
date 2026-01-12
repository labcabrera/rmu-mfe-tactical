import React, { FC } from 'react';
import { IconButton, SxProps, Theme, Tooltip } from '@mui/material';

type ActionIconButtonProps = {
  tooltipTitle?: string;
  onClick?: () => void;
  disabled?: boolean;
  imageSrc?: string; // URL or data URL for the background image
  size?: number; // px
  ariaLabel?: string;
  sx?: SxProps<Theme>;
};

const ActionIconButton: FC<ActionIconButtonProps> = ({
  tooltipTitle,
  onClick,
  disabled = false,
  imageSrc,
  size = 28,
  ariaLabel,
  sx,
}) => {
  const baseSx: SxProps<Theme> = {
    width: size,
    height: size,
    p: 0,
    bgcolor: 'transparent',
    backgroundImage: imageSrc ? `url("${imageSrc}")` : undefined,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    borderRadius: 1,
    transition: 'background-color 150ms ease',
    '&:hover': { bgcolor: 'action.hover' },
  };

  // Merge baseSx with incoming sx when sx is a plain object; otherwise prefer baseSx.
  const mergedSx =
    sx && typeof sx === 'object' && !Array.isArray(sx) ? { ...(baseSx as object), ...(sx as object) } : baseSx;

  return (
    <Tooltip title={tooltipTitle}>
      <IconButton onClick={onClick} disabled={disabled} sx={mergedSx as any} aria-label={ariaLabel} />
    </Tooltip>
  );
};

export default ActionIconButton;
