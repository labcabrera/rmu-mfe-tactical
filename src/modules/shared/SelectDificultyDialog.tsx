import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { DIFFICULTY_TABLE } from '../api/action.dto';

const SelectDifficulty: FC<{
  value: string | null | undefined;
  readOnly?: boolean;
  onChange: (value: string | null) => void;
}> = ({ value, readOnly = false, onChange }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const buttonLabel = value ? `${t('difficulty')}: ${t(`difficulty-${value}`)}` : t('difficulty');

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
        {buttonLabel}
      </Button>
      {!readOnly && (
        <Dialog maxWidth="xs" open={open}>
          <DialogTitle>{t('select-difficulty')}</DialogTitle>
          <DialogContent dividers>
            <RadioGroup value={value} onChange={(e) => onItemListClick(e.target.value)}>
              {DIFFICULTY_TABLE.map((option, index) => (
                <FormControlLabel
                  value={option.key}
                  key={index}
                  control={<Radio />}
                  color={option.value < 0 ? 'error' : undefined}
                  label={`${t(`difficulty-${option.key}`)} ${option.value > 0 ? '+' : ''}${option.value}`}
                />
              ))}
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => onClear()}>
              {t('clear')}
            </Button>
            <Button autoFocus onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default SelectDifficulty;
