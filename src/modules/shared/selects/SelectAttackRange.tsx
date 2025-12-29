import React, { FC, useContext, useEffect, useState } from 'react';
import { Badge, FormControl, FormLabel, ToggleButtonGroup, ToggleButton } from '@mui/material';
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

  const [index, setIndex] = useState<number | null>(null);
  const { strategicGame } = useContext(CombatContext)!;

  const handleClick = (opt: ActorRoundAttackRange) => {
    if (readOnly) return;
    const mid = opt.from + (opt.to - opt.from) / 2;
    onChange(mid);
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

  useEffect(() => {
    if (value === null) {
      setIndex(null);
      return;
    }
    const idx = attack.ranges?.findIndex((r) => r.from <= value && r.to >= value) || null;
    setIndex(idx);
  }, [value, attack.ranges]);

  return (
    <FormControl component="fieldset">
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('range')}
      </FormLabel>
      <ToggleButtonGroup value={index} exclusive>
        {attack.ranges!.map((option) => {
          return (
            <Badge key={`${option.from}-${option.to}`} badgeContent={badgeContent(option)} color={badgeColor(option)}>
              <ToggleButton
                value={index}
                onClick={() => handleClick(option)}
                disabled={readOnly}
                sx={{ minWidth: 140 }}
              >
                {buttonText(option)}
              </ToggleButton>
            </Badge>
          );
        })}
      </ToggleButtonGroup>
      index: {index}. range: {value}
    </FormControl>
  );
};

export default SelectAttackRange;
