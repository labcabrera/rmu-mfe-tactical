import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { styled } from '@mui/system';

const StyledIconButton = styled(IconButton)<IconButtonProps>(({ disabled }) => ({
  '& img': {
    filter: disabled ? 'grayscale(100%) opacity(0.3)' : 'none',
    transition: 'filter 0.3s ease-in-out',
  },
  '&:hover img': {
    filter: disabled ? 'grayscale(100%) opacity(0.5)' : 'brightness(1.4)',
  },
}));

export default StyledIconButton;
