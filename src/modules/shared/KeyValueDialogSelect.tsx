import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Stack,
} from '@mui/material';
import { KeyValue } from '@labcabrera-rmu/rmu-react-shared-lib';
import { imageBaseUrl } from '../services/config';

export default function KeyValueDialogSelect({
  label,
  value,
  options,
  readOnly = false,
  onChange,
  colorDisabledValues,
}: {
  label: string;
  value: string | null | undefined;
  options: KeyValue[];
  readOnly?: boolean;
  colorDisabledValues?: string[];
  onChange: (value: string | null) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const modifier = value ? options.find((e) => e.key === value)?.value : undefined;
  const modifierStr = modifier !== undefined && modifier !== 0 ? ` (${modifier > 0 ? '+' : ''}${modifier})` : undefined;
  const selectedOption = modifier !== undefined ? `${t(value!)}${modifierStr ? modifierStr : ''}` : undefined;

  const getColor = () => {
    if (value && colorDisabledValues && colorDisabledValues.includes(value)) {
      return 'secondary';
    }
    return modifier && modifier < 0 ? 'error' : modifier && modifier > 1 ? 'success' : undefined;
  };

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
                {selectedOption ? `${t(label)}:` : t(label)}
              </Typography>
              {selectedOption && (
                <Typography sx={{ fontWeight: 600 }} color={getColor()}>
                  {selectedOption}
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
                <ToggleButton key={index} value={option.key}>
                  {`${t(option.key)} (${option.value > 0 ? '+' : ''}${option.value})`}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
