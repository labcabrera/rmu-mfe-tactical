import React, { FC, useContext } from 'react';
import { Stack, Button, Badge, FormControl, FormLabel } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { ActorRoundAttack, ActorRoundAttackRange } from '../../api/actor-rounds.dto';

const SelectAttackRange: FC<{
  attack: ActorRoundAttack;
  value: number | null;
  onChange: (value: number | null) => void;
  readOnly?: boolean;
}> = ({ attack, value, onChange, readOnly = false }) => {
  const labelId = 'action-range-selector-label';

  const { strategicGame } = useContext(CombatContext)!;

  const handleClick = (opt: ActorRoundAttackRange) => {
    if (readOnly) return;
    onChange(opt.from + (opt.to - opt.from) / 2);
  };

  const buttonText = (option: ActorRoundAttackRange): string => {
    const scale = strategicGame?.options.boardScaleMultiplier || 1;
    const scaleOpt = scale !== 1 ? ` (${Math.round(option.to * scale)})` : '';
    return `${Math.round(option.from)}' ↔ ${Math.round(option.to)}'${scaleOpt}`;
  };

  const badgeContent = (option: ActorRoundAttackRange): string => {
    if (!option || !option.bonus || option.bonus === 0) return '+0';
    return option.bonus.toString();
  };

  const badgeColor = (option: ActorRoundAttackRange): 'success' | 'error' | 'secondary' => {
    if (option.bonus === 0) return 'secondary';
    return option.bonus > 0 ? 'success' : 'error';
  };

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('range')}
      </FormLabel>
      <Stack direction="row" spacing={readOnly ? 1 : 2} sx={{ flexWrap: 'wrap' }}>
        {attack.ranges!.map((option) => {
          const selected = value && option.from <= value && option.to >= value;
          return (
            <Badge key={`${option.from}-${option.to}`} badgeContent={badgeContent(option)} color={badgeColor(option)}>
              <Button
                size="large"
                variant={selected ? 'contained' : 'outlined'}
                color={selected ? 'primary' : 'inherit'}
                onClick={() => handleClick(option)}
                disabled={readOnly}
              >
                {buttonText(option)}
              </Button>
            </Badge>
          );
        })}
      </Stack>
    </FormControl>
  );
};

export default SelectAttackRange;
