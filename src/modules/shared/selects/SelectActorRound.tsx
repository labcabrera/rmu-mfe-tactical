import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { ActorRound } from '../../api/actor-rounds';

type SelectActorRoundProps = {
  value: string | number;
  onChange: (e: ActorRound) => void;
  name?: string;
  actorRounds: ActorRound[];
  i18nLabel?: string;
};

const SelectActorRound: React.FC<SelectActorRoundProps> = ({ value, onChange, actorRounds, name = 'selectActorRound', i18nLabel = 'actor' }) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedActorRound = actorRounds.find((ar) => ar.id === e.target.value);
    if (selectedActorRound) {
      onChange(selectedActorRound);
    }
  };

  if (!actorRounds) {
    return <p>Loading...</p>;
  }

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
