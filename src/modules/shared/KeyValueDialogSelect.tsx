import React, { FC, useState } from 'react';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { Button, Dialog, DialogContent, DialogTitle, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { KeyValue } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { imageBaseUrl } from '../services/config';

const KeyValueDialogSelect: FC<{
  label: string;
  value: string | null | undefined;
  options: KeyValue[];
  readOnly?: boolean;
  onChange: (value: string | null) => void;
}> = ({ label, value, options, readOnly = false, onChange }) => {
  const [open, setOpen] = useState(false);

  const modifier = value ? options.find((e) => e.key === value)?.value : undefined;
  const selectedOption = modifier !== undefined ? `: ${t(value!)} (${modifier > 0 ? '+' : ''}${modifier})` : undefined;

  const onItemListClick = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={readOnly}
        startIcon={!value ? <ErrorOutlineOutlinedIcon /> : <TaskAltIcon />}
        size="small"
        color={!value ? 'warning' : 'secondary'}
        fullWidth
      >
        {`${t(label)}${selectedOption ? selectedOption : ''}`}
      </Button>
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
              size="small"
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
};

export default KeyValueDialogSelect;
