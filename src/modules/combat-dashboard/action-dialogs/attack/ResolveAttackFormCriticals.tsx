import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { Stack, Grid, Typography } from '@mui/material';
import { CategorySeparator, NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { updateCriticalRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import Effect from '../../../shared/generic/Effect';

const ResolveAttackFormCriticals: FC<{
  formData: AttackDeclaration;
  action: Action;
  index: number;
  attack: ActionAttack;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, action, index, attack, setFormData }) => {
  const { updateAction } = useContext(CombatContext)!;
  const { showError } = useError();

  if (!formData || !formData.attacks || formData.attacks.length <= index) return <div>Loading...</div>;

  const getCriticalRoll = (criticalKey: string): number | undefined => {
    let roll: number | undefined;
    try {
      roll = attack.roll!.criticalRolls[criticalKey];
    } catch (e) {
      console.error(e);
    }
    return roll;
  };

  const onUpdateCriticalRoll = (criticalKey: string, roll: number) => {
    updateCriticalRoll(action.id, attack.attackName, criticalKey, roll)
      .then((updatedAction) => {
        const newFormData = { attacks: updatedAction.attacks, parries: undefined };
        updateAction(updatedAction);
        setFormData(newFormData);
      })
      .catch((err) => showError(err.message));
  };

  const getStatusLabel = (effect: any) => {
    const labels = [];
    if (effect.value) {
      labels.push(`${t(effect.status)} ${effect.value}`);
    } else {
      labels.push(t(effect.status));
    }
    if (effect.rounds) {
      labels.push(`${effect.rounds} ${effect.rounds === 1 ? ' Round' : ' Rounds'}`);
    }
    if (effect.deplay) labels.push(`${effect.rounds} Delay`);
    return labels.join(', ');
  };

  return (
    <>
      <Grid container spacing={1} mt={1}>
        {attack.results!.criticals.map((critical, index) => (
          <Fragment key={index}>
            <Grid size={12}>
              <CategorySeparator text={`Critical ${critical.criticalType}${critical.criticalSeverity}`} />
            </Grid>
            <Grid size={2}>
              <NumericInput
                label={t('Critical roll')}
                value={getCriticalRoll(critical.key) || null}
                onChange={(e) => onUpdateCriticalRoll(critical.key, e)}
                disabled={action.status === 'completed'}
              />
            </Grid>
            <Grid size={2}></Grid>
            <Grid size={2}>
              <Stack>
                <Typography variant="h6">{critical.adjustedRoll}</Typography>
                <Typography variant="body2" color="secondary">
                  Total
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                alignContent="flex-start"
                sx={{
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                }}
              >
                {critical.result && critical.result.damage && critical.result.damage > 0 && (
                  <Effect status={'dmg'} label={critical.result.damage} color="error" />
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
