import React, { ChangeEvent, FC } from 'react';
import { FormControl, FormLabel, ToggleButtonGroup, ToggleButton, Badge } from '@mui/material';
import { t } from 'i18next';
import { ActorRound } from '../../api/actor-rounds.dto';

const SelectCalledShot: FC<{
  value?: string;
  target?: ActorRound;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  readOnly?: boolean;
}> = ({ value = 'none', target, onChange, name = 'calledShot', label = 'Called Shot', readOnly = false }) => {
  const labelId = `select-called-shot-${name}-label`;
  const options = ['none', 'head', 'body', 'arms', 'legs'];

  const handleClick = (option: string) => {
    if (readOnly) return;
    const evt = { target: { name, value: option } } as unknown as ChangeEvent<HTMLInputElement>;
    onChange(evt);
  };

  const badgeContent = (option: string): string | null => {
    if (readOnly) return null;
    if (!target) return null;
    switch (option) {
      case 'none':
        return target.defense.at ? target.defense.at.toString() : 'N/A';
      case 'head':
        return target.defense.at ? target.defense.at.toString() : target.defense.headAt!.toString();
      case 'body':
        return target.defense.at ? target.defense.at.toString() : target.defense.bodyAt!.toString();
      case 'arms':
        return target.defense.at ? target.defense.at.toString() : target.defense.armsAt!.toString();
      case 'legs':
        return target.defense.at ? target.defense.at.toString() : target.defense.legsAt!.toString();
      default:
        return null;
    }
  };

  return (
    <FormControl component="fieldset">
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t(label)}
      </FormLabel>
      <ToggleButtonGroup value={value} exclusive>
        {options.map((option) => (
          <Badge badgeContent={badgeContent(option)} color="secondary">
            <ToggleButton value={option} onClick={() => handleClick(option)} disabled={readOnly} sx={{ minWidth: 140 }}>
              {t(option)}
            </ToggleButton>
          </Badge>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectCalledShot;
