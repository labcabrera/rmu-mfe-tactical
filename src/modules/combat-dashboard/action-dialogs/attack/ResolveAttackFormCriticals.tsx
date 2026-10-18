import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Stack, Grid, Typography } from '@mui/material';
import { CategorySeparator, NumericInput, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { fetchAction, updateCriticalRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
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

  if (!attack.roll || !attack.roll.criticalRolls) return <pre>{t('error')}</pre>;

  const getCriticalRoll = (criticalKey: string): number | null | undefined => {
    let roll: number | null | undefined;
    try {
      roll = attack.roll!.criticalRolls![criticalKey];
    } catch (e) {
      console.error(e);
    }
    return roll;
  };

  const onUpdateCriticalRoll = (criticalKey: string, roll: number) => {
    updateCriticalRoll(action.id, attack.attackName, criticalKey, roll, auth)
      .then(() => fetchAction(action.id, auth))
      .then((currentAction) => {
        const newFormData = { attacks: currentAction.attacks || [], parries: currentAction.parries || [] };
        updateAction(currentAction);
        setFormData(newFormData);
      })
      .catch((err) => notify.error(err));
  };

  const getStatusLabel = (effect: any) => {
    const labels = [];
    if (effect.value) {
      labels.push(`${t(effect.status)} ${effect.value}`);
    } else {
      labels.push(t(effect.status));
    }
    if (effect.rounds) {
      labels.push(`${effect.rounds} ${effect.rounds === 1 ? t('round') : t('rounds')}`);
    }
    if (effect.deplay) labels.push(`${effect.rounds} ${t('delay')}`);
    return labels.join(', ');
  };

  return (
    <>
      <Grid container spacing={1} sx={{ mt: 1 }}>
        {attack.results!.criticals.map((critical, index) => (
          <Fragment key={index}>
            <Grid size={12}>
              <CategorySeparator
                text={t('critical-code', { code: `${critical.criticalType}${critical.criticalSeverity}` })}
              />
            </Grid>
            <Grid size={2}>
              <NumericInput
                label={t('critical-roll')}
                value={getCriticalRoll(critical.key) || null}
                onChange={(e) => onUpdateCriticalRoll(critical.key, e || 1)}
                disabled={action.status === 'completed'}
              />
            </Grid>
            <Grid size={2}></Grid>
            <Grid size={2}>
              <Stack>
                <Typography variant="h6">{critical.adjustedRoll}</Typography>
                <Typography variant="body2" color="secondary">
                  {t('total')}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
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
                {critical.result && critical.result.damage && critical.result.damage > 0 && (
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
            <Grid size={6}></Grid>
            <Grid size={6}>{critical.result?.text || ''}</Grid>
          </Fragment>
        ))}
      </Grid>
    </>
  );
};

export default ResolveAttackFormCriticals;
