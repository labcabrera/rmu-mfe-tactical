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

  const handleClick = (opt: ActorRoundAttackRange, idx: number) => {
    if (readOnly) return;
    const mid = opt.from + (opt.to - opt.from) / 2;
    setIndex(idx);
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
    const idx = attack.ranges?.findIndex((r) => r.from <= value && r.to >= value);
    setIndex(typeof idx === 'number' && idx >= 0 ? idx : null);
  }, [value, attack.ranges]);

  return (
    <FormControl component="fieldset">
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('range')}
      </FormLabel>
      <ToggleButtonGroup
        value={index}
        exclusive
        onChange={(_, newIndex: number | null) => {
          if (readOnly) return;
          if (newIndex === null) {
            setIndex(null);
            onChange(null);
            return;
          }
          const opt = attack.ranges![newIndex];
          const mid = opt.from + (opt.to - opt.from) / 2;
          setIndex(newIndex);
          onChange(mid);
        }}
      >
        {attack.ranges!.map((option, i) => (
          <Badge key={`${option.from}-${option.to}`} badgeContent={badgeContent(option)} color={badgeColor(option)}>
            <ToggleButton value={i} disabled={readOnly} sx={{ minWidth: 140 }} onClick={() => handleClick(option, i)}>
              {buttonText(option)}
            </ToggleButton>
          </Badge>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectAttackRange;
