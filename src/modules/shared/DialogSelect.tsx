import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import { imageBaseUrl } from '../services/config';

const DialogSelect: FC<{
  label: string;
  value: string | null | undefined;
  options: string[];
  readOnly?: boolean;
  colorDisabledValues?: string[];
  colorErrorValues?: string[];
  colorSuccessValues?: string[];
  onChange: (value: string | null) => void;
}> = ({
  label,
  value,
  options,
  readOnly = false,
  colorDisabledValues,
  colorErrorValues,
  colorSuccessValues,
  onChange,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const onItemListClick = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  const getColor = () => {
    if (value) {
      if (colorDisabledValues && colorDisabledValues.includes(value)) return 'secondary';
      if (colorErrorValues && colorErrorValues.includes(value)) return 'error';
      if (colorSuccessValues && colorSuccessValues.includes(value)) return 'success';
    }
  };

  return (
    <>
      <Card sx={{ width: '100%', boxShadow: 'none' }}>
        <CardActionArea onClick={() => !readOnly && setOpen(true)}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" spacing={1}>
              <Typography sx={{ fontWeight: 600 }} color={!value ? 'error' : undefined}>
                {value ? `${t(label)}:` : t(label)}
              </Typography>
              {value && (
                <Typography sx={{ fontWeight: 600 }} color={getColor()}>
                  {t(value)}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
      {!readOnly && (
        <Dialog maxWidth="xs" open={open}>
          <DialogTitle>{label}</DialogTitle>
          <DialogContent
            sx={{
              p: 2,
              backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.95)), url(${imageBaseUrl}images/backgrounds/action-movement-screen.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat',
              minWidth: 400,
            }}
          >
            <ToggleButtonGroup
              orientation="vertical"
              value={value}
              exclusive
              onChange={(e, v) => onItemListClick(v)}
              fullWidth
              sx={{ mt: 2 }}
            >
              {options.map((option, index) => (
                <ToggleButton key={index} value={option}>
                  {t(option)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DialogSelect;
