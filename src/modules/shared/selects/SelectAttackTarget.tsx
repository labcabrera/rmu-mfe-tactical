import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

type Target = {
  id: string | number;
  [key: string]: any;
};

type SelectAttackTargetProps = {
  value: string | number;
  onChange: (targetId: string | number) => void;
  sourceId: string | number;
  includeSource?: boolean;
  targets?: Target[];
  i18nLabel?: string;
};

const SelectAttackTarget: React.FC<SelectAttackTargetProps> = ({
  value,
  onChange,
  sourceId,
  includeSource = false,
  targets,
  i18nLabel = 'target',
}) => {
  const { t } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetId = event.target.value;
    onChange(targetId);
  };

  if (!targets) {
    return <p>Loading...</p>;
  }

  return (
    <TextField
      select
      id="select-attack-target"
      label={t(i18nLabel)}
      fullWidth
      value={value === undefined || value === null || targets.length === 0 ? '' : value}
      variant="standard"
      onChange={handleChange}
    >
      {targets
        .filter((e) => e.id !== sourceId || includeSource)
        .map((option, index) => (
          <MenuItem key={index} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
    </TextField>
  );
};

export default SelectAttackTarget;
