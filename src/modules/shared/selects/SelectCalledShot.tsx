import React, { ChangeEvent, FC } from 'react';
import { FormControl, ToggleButtonGroup, ToggleButton, Badge, Tooltip } from '@mui/material';
import { t } from 'i18next';
import { CalledShot } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';

const SelectCalledShot: FC<{
  value?: string;
  target?: ActorRound;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  readOnly?: boolean;
}> = ({ value = 'none', target, onChange, name = 'calledShot', readOnly = false }) => {
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
      case 'chest':
      case 'abdomen':
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
    <Tooltip title={t('called-shot')}>
      <FormControl component="fieldset">
        <ToggleButtonGroup value={value} exclusive>
          {(['none', 'head', 'chest', 'abdomen', 'arms', 'legs'] as CalledShot[]).map((option) => (
            <Badge key={option} badgeContent={badgeContent(option)} color="secondary">
              <ToggleButton
                key={`${option}-btn`}
                value={option}
                onClick={() => handleClick(option)}
                disabled={readOnly}
                size="small"
                sx={{ minWidth: 140 }}
              >
                {t(option)}
              </ToggleButton>
            </Badge>
          ))}
        </ToggleButtonGroup>
      </FormControl>
    </Tooltip>
  );
};

export default SelectCalledShot;
