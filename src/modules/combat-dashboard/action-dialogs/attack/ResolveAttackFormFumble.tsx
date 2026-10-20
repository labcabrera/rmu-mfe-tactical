import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid, Stack, Typography } from '@mui/material';
import { CategorySeparator, ConfirmedRollInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { updateFumbleRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration, CriticalEffect } from '../../../api/action.dto';
import { useTacticalNotify } from '../../../services/notify-service';
import Effect from '../../../shared/generic/Effect';

const ResolveAttackFormFumble: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  action: Action;
  index: number;
  attack: ActionAttack;
}> = ({ formData, setFormData, action, index, attack }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { updateAction } = useContext(CombatContext)!;
  const notify = useTacticalNotify();
  const fumble = attack.results?.fumble;

  if (!formData || !formData.attacks || formData.attacks.length <= index || !fumble) return null;

  const onUpdateFumbleRoll = (roll: number) => {
    updateFumbleRoll(action.id, attack.attackName, roll, auth)
      .then((currentAction) => {
        const newFormData = { attacks: currentAction.attacks || [], parries: currentAction.parries || [] };
        updateAction(currentAction);
        setFormData(newFormData);
      })
      .catch((err) => notify.error(err));
  };

  const getEffectLabel = (effect: CriticalEffect) => {
    const labels = [effect.value ? `${t(effect.status)} ${effect.value}` : t(effect.status)];
    if (effect.rounds) labels.push(`${effect.rounds} ${effect.rounds === 1 ? t('round') : t('rounds')}`);
    if (effect.delay) labels.push(`${t('delay')} ${effect.delay}`);
    return labels.join(', ');
  };

  return (
    <Grid container spacing={1} sx={{ mt: 1 }}>
      <Grid size={12}>
        <CategorySeparator text={t('fumble')} />
      </Grid>
      <Grid size={6}>
        <ConfirmedRollInput
          label={t('fumble-roll')}
          value={attack.roll?.fumbleRoll}
          onConfirm={onUpdateFumbleRoll}
          disabled={action.status === 'completed'}
        />
      </Grid>
      <Grid size={12}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {!!fumble.damage && fumble.damage > 0 && (
            <Effect status={'dmg'} label={t('damage-n', { damage: fumble.damage })} color="error" />
          )}
          {(fumble.effects ?? []).map((effect, effectIndex) => (
            <Effect key={effectIndex} status={effect.status} label={getEffectLabel(effect)} color="error" />
          ))}
        </Stack>
      </Grid>
      {fumble.text && <Grid size={12}>{fumble.text}</Grid>}
      {fumble.additionalDamageText && (
        <Grid size={12}>
          <Typography variant="body2" color="text.secondary">
            {t('fumble-additional-damage')}: {fumble.additionalDamageText}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default ResolveAttackFormFumble;
