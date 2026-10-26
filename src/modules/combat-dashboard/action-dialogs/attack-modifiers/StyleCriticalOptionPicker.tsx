import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography } from '@mui/material';
import { AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { ATTACK_STYLE_OPTIONS, CRITICAL_STYLE_OPTIONS, styleOptionsFor } from '../attack/style-critical-options';
import OptionTiles from './pickers/OptionTiles';

const NONE = 'none';

/**
 * Fighting style ability that changes the critical of the attack (spec 032, group C). Leg Sweep, Weapon Breaker
 * and Binding Chain are decided here; the rest can also wait for the critical roll.
 */
const StyleCriticalOptionPicker: FC<{
  actorRound: ActorRound;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  attackName: string;
}> = ({ actorRound, formData, setFormData, attackName }) => {
  const { t } = useTranslation();
  const options = styleOptionsFor(actorRound, attackName, [...ATTACK_STYLE_OPTIONS, ...CRITICAL_STYLE_OPTIONS]);
  if (options.length === 0) return null;
  const value = formData.attacks.find((a) => a.attackName === attackName)?.modifiers.styleCriticalOption || NONE;

  const change = (key: string) =>
    setFormData((prev) => ({
      ...prev,
      attacks: prev.attacks.map((attack) =>
        attack.attackName === attackName
          ? { ...attack, modifiers: { ...attack.modifiers, styleCriticalOption: key === NONE ? null : key } }
          : attack
      ),
    }));

  return (
    <Card component="section" aria-label={t('style-critical-option')}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('style-critical-option')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('style-critical-option-help')}
        </Typography>
        <OptionTiles
          label={t('fighting-style')}
          options={[
            { key: NONE, value: null },
            ...options.map((key) => ({ key, value: key === 'binding-chain' ? -10 : null })),
          ]}
          value={value}
          optionLabel={(option) => (option.key === NONE ? t('none') : t(`style-ability-${option.key}`))}
          onChange={change}
        />
      </CardContent>
    </Card>
  );
};

export default StyleCriticalOptionPicker;
