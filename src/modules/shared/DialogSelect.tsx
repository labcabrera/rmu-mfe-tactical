import React, { FC, useState } from 'react';
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
import { t } from 'i18next';
import { imageBaseUrl } from '../services/config';

const DialogSelect: FC<{
  label: string;
  value: string | null | undefined;
  options: string[];
  readOnly?: boolean;
  onChange: (value: string | null) => void;
}> = ({ label, value, options, readOnly = false, onChange }) => {
  const [open, setOpen] = useState(false);

  const onItemListClick = (code: string) => {
    onChange(code);
    setOpen(false);
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
              {value && <Typography sx={{ fontWeight: 600 }}>{value}</Typography>}
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
