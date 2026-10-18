import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Stack, Grid, Typography } from '@mui/material';
import { CategorySeparator, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { updateCriticalRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration, CriticalEffect } from '../../../api/action.dto';
import { criticalCode } from '../../../services/action-service';
import ConfirmedRollInput from '../../../shared/generic/ConfirmedRollInput';
import Effect from '../../../shared/generic/Effect';

const ResolveAttackFormCriticals: FC<{
  formData: AttackDeclaration;
  action: Action;
  index: number;
  attack: ActionAttack;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, action, index, attack, setFormData }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { updateAction } = useContext(CombatContext)!;
  const notify = useNotify();

  if (!formData || !formData.attacks || formData.attacks.length <= index) return null;

  // Critical rolls are absent until the first one is stored.
  const getCriticalRoll = (criticalKey: string): number | null | undefined => attack.roll?.criticalRolls?.[criticalKey];

  const onUpdateCriticalRoll = (criticalKey: string, roll: number) => {
    updateCriticalRoll(action.id, attack.attackName, criticalKey, roll, auth)
      .then((currentAction) => {
        const newFormData = { attacks: currentAction.attacks || [], parries: currentAction.parries || [] };
        updateAction(currentAction);
        setFormData(newFormData);
      })
      .catch((err) => notify.error(err));
  };

  const getStatusLabel = (effect: CriticalEffect) => {
    const labels = [];
    if (effect.value) {
      labels.push(`${t(effect.status)} ${effect.value}`);
    } else {
      labels.push(t(effect.status));
    }
    if (effect.rounds) {
      labels.push(`${effect.rounds} ${effect.rounds === 1 ? t('round') : t('rounds')}`);
    }
    if (effect.delay) labels.push(`${t('delay')} ${effect.delay}`);
    return labels.join(', ');
  };

  return (
    <>
      <Grid container spacing={1} sx={{ mt: 1 }}>
        {(attack.results?.criticals ?? []).map((critical, index) => (
          <Fragment key={index}>
            <Grid size={12}>
              <CategorySeparator
                text={t('critical-code', { code: criticalCode(critical.criticalType, critical.criticalSeverity) })}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <ConfirmedRollInput
                label={t('critical-roll')}
                value={getCriticalRoll(critical.key)}
                onConfirm={(roll) => onUpdateCriticalRoll(critical.key, roll)}
                disabled={action.status === 'completed'}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }} offset={{ md: 2 }}>
              <Stack>
                <Typography variant="h6">{critical.adjustedRoll}</Typography>
                <Typography variant="body2" color="secondary">
                  {t('total')}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{
                  flexWrap: 'wrap',
                  alignContent: 'flex-start',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                }}
              >
                {!!critical.result?.damage && critical.result.damage > 0 && (
                  <Effect status={'dmg'} label={`${critical.result.damage}`} color="error" />
                )}
                {critical.result &&
                  critical.result.effects &&
                  critical.result.effects.length > 0 &&
                  critical.result.effects.map((effect, effectIndex) => (
                    <Effect key={effectIndex} label={getStatusLabel(effect)} color="error" status={effect.status} />
                  ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} offset={{ md: 6 }}>
              {critical.result?.text || ''}
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </>
  );
};

export default ResolveAttackFormCriticals;
