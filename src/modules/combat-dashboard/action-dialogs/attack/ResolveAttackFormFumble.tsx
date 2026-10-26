import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid, Stack, Typography } from '@mui/material';
import { CategorySeparator, D100, RollField, RollSpec } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { updateFumbleRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration, CriticalEffect } from '../../../api/action.dto';
import { useTacticalNotify } from '../../../services/notify-service';
import Effect from '../../../shared/generic/Effect';
import { criticalEffectLabel } from './critical-effect-label';

/** The dice of the hits of a fumble entry (`2d10`) as a roll, undefined when its hits are fixed or it has none. */
const hitsSpec = (effects: CriticalEffect[] | undefined): { dice: string; spec: RollSpec } | undefined => {
  const dice = effects?.find((effect) => effect.status === 'hits' && effect.dice)?.dice;
  const match = dice ? /^(\d+)d(\d+)$/.exec(dice) : null;
  return match
    ? { dice: dice!, spec: { dice: Number(match[1]), sides: Number(match[2]), openEnded: 'none' } }
    : undefined;
};

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

  // Spec 034: the API rolls the dice of the hits; the game master can give the sum of a roll of their own instead.
  const hits = hitsSpec(fumble.effects);

  const onUpdateFumbleRoll = (roll: number, fumbleHits?: number) => {
    updateFumbleRoll(action.id, attack.attackName, roll, auth, fumbleHits)
      .then((currentAction) => {
        const newFormData = { attacks: currentAction.attacks || [], parries: currentAction.parries || [] };
        updateAction(currentAction);
        setFormData(newFormData);
      })
      .catch((err) => notify.error(err));
  };

  return (
    <Grid container spacing={1} sx={{ mt: 1 }}>
      <Grid size={12}>
        <CategorySeparator text={t('fumble')} />
      </Grid>
      <Grid size={6}>
        <RollField
          spec={D100}
          label={t('fumble-roll')}
          value={attack.roll?.fumbleRoll}
          onChange={(roll) => onUpdateFumbleRoll(roll.total)}
          disabled={action.status === 'completed'}
        />
      </Grid>
      {hits && attack.roll?.fumbleRoll && (
        <Grid size={6}>
          <RollField
            spec={hits.spec}
            label={t('fumble-hits-dice', { dice: hits.dice })}
            value={fumble.damage}
            onChange={(roll) => onUpdateFumbleRoll(attack.roll!.fumbleRoll!, roll.total)}
            disabled={action.status === 'completed'}
          />
        </Grid>
      )}
      <Grid size={12}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {!!fumble.damage && fumble.damage > 0 && (
            <Effect status={'dmg'} label={t('damage-n', { damage: fumble.damage })} color="error" />
          )}
          {(fumble.effects ?? []).map((effect, effectIndex) => (
            <Effect key={effectIndex} status={effect.status} label={criticalEffectLabel(effect, t)} color="error" />
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
