import React, { FC } from 'react';
import { Button, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const RmuImageButton: FC<{
  src: string;
  size?: number;
  disabled?: boolean;
  tooltip?: string;
  color?: string;
  onClick: () => void;
  tint?: boolean;
}> = ({ src, size = 45, disabled = false, color = 'primary', tooltip, onClick, tint = true }) => {
  const theme = useTheme();

  const getBgFromColor = (clr?: string) => {
    if (!clr) return theme.palette.success.main;
    if (clr.includes('.')) {
      const [paletteKey, shade] = clr.split('.');
      const candidate = (theme.palette as any)[paletteKey]?.[shade];
      if (typeof candidate === 'string') return candidate;
    } else {
      const p = (theme.palette as any)[clr];
      if (typeof p === 'string') return p;
      if (p && p.main) return p.main;
    }
    return clr; // fallback: assume it's a valid CSS color
  };

  const bg = tint ? getBgFromColor(color) : undefined;

  const maskedStyle: React.CSSProperties = tint
    ? {
        width: size,
        height: size,
        backgroundColor: bg,
        WebkitMask: `url(${src}) no-repeat center / contain`,
        mask: `url(${src}) no-repeat center / contain`,
        display: 'inline-block',
      }
    : { width: size, height: size };

  return (
    <Tooltip title={tooltip}>
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="text"
        sx={{
          p: 0,
          minWidth: 'auto',
        }}
      >
        {tint ? (
          <span aria-hidden style={maskedStyle} />
        ) : (
          <img src={src} alt={tooltip} style={{ width: size, height: size }} />
        )}
      </Button>
    </Tooltip>
  );
};
export default RmuImageButton;
