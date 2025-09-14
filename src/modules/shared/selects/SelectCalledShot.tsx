import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

type SelectActorRoundProps = {
  value: string | number;
  onChange: (e: ActorRound) => void;
  name?: string;
  actorRounds: ActorRound[];
  label: string;
};

const SelectActorRound: FC<SelectActorRoundProps> = ({ value, onChange, name = 'selectActorRound', label }) => {
  const { t } = useTranslation();

  return (
    <TextField
      select
      id="select-actor-round"
      name={name}
      label={t(i18nLabel)}
      fullWidth
      value={value === undefined || value === null || actorRounds.length === 0 ? '' : value}
      variant="standard"
      onChange={handleChange}
    >
      {actorRounds.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {option.actorName}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectActorRound;
