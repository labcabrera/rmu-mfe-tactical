import React, { FC, useState } from 'react';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { Button, Dialog, DialogContent, DialogTitle, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';

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
      <Button
        onClick={() => setOpen(true)}
        disabled={readOnly}
        startIcon={!value ? <ErrorOutlineOutlinedIcon /> : <TaskAltIcon />}
        size="small"
        color={!value ? 'warning' : 'secondary'}
        fullWidth
      >
        {`${t(label)}${value ? `: ${value}` : ''}`}
      </Button>
      {!readOnly && (
        <Dialog maxWidth="xs" open={open}>
          <DialogTitle>{label}</DialogTitle>
          <DialogContent dividers>
            <ToggleButtonGroup
              orientation="vertical"
              value={value}
              exclusive
              onChange={(e, v) => onItemListClick(v)}
              fullWidth
              size="small"
            >
              {options.map((option, index) => (
                <ToggleButton key={index} value={option}>
                  {t(option)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </DialogContent>
          {/* <DialogActions>
            <Button autoFocus onClick={() => onClear()}>
              Clear
            </Button>
            <Button autoFocus onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogActions> */}
        </Dialog>
      )}
    </>
  );
};

export default DialogSelect;
