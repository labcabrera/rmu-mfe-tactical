import React, { FC, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
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

type DifficultyCode = {
  id: string;
  code: string;
  modifier: number;
};

// startIcon={<DeleteIcon />}

const SelectDifficulty: FC<{
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const [open, setOpen] = useState(false);

  const codes: DifficultyCode[] = [
    { id: 'casual', code: 'c', modifier: 70 },
    { id: 'simple', code: 's', modifier: 50 },
    { id: 'routine', code: 'r', modifier: 30 },
    { id: 'easy', code: 'e', modifier: 20 },
    { id: 'light', code: 'l', modifier: 10 },
    { id: 'medium', code: 'm', modifier: 0 },
    { id: 'hard', code: 'h', modifier: -10 },
    { id: 'very_hard', code: 'vh', modifier: -20 },
    { id: 'extremely_hard', code: 'xh', modifier: -30 },
    { id: 'sheer_folly', code: 'sf', modifier: -50 },
    { id: 'absurd', code: 'a', modifier: -70 },
    { id: 'nigh_impossible', code: 'ni', modifier: -100 },
  ];

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
        size="large"
        color={!value ? 'warning' : 'secondary'}
        fullWidth
      >
        {`Difficulty${value ? `: ${value}` : ''}`}
      </Button>
      {!readOnly && (
        <Dialog maxWidth="xs" open={open}>
          <DialogTitle>{t('Select difficulty')}</DialogTitle>
          <DialogContent dividers>
            <RadioGroup value={value} onChange={(e) => onItemListClick(e.target.value)}>
              {codes.map((option, index) => (
                <FormControlLabel
                  value={option.id}
                  key={index}
                  control={<Radio />}
                  color={option.modifier < 0 ? 'error' : undefined}
                  label={`${t(option.id)} ${option.modifier > 0 ? '+' : ''}${option.modifier}`}
                />
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

export default SelectDifficulty;
