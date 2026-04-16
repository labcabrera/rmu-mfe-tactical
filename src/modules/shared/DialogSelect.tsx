import React, { FC, useState } from 'react';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
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

  const onClear = () => {
    onChange(null);
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
          <DialogTitle>{t('Select difficulty')}</DialogTitle>
          <DialogContent dividers>
            <RadioGroup value={value} onChange={(e) => onItemListClick(e.target.value)}>
              {options.map((option, index) => (
                <FormControlLabel value={option} key={index} control={<Radio />} label={`${t(option)}`} />
              ))}
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => onClear()}>
              Clear
            </Button>
            <Button autoFocus onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default DialogSelect;
