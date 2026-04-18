import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { Stack, Grid } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { updateCriticalRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import Effect from '../../../shared/generic/Effect';

const ResolveAttackFormCriticals: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  action: Action;
  index: number;
  attack: ActionAttack;
}> = ({ formData, setFormData, action, index, attack }) => {
  const { updateAction } = useContext(CombatContext);
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
      .catch((err: Error) => showError(err.message));
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
      {attack.results.criticals.map((critical: any, index: number) => (
        <Fragment key={index}>
          <Grid size={2}>
            <NumericInput
              label={t('critical-roll')}
              value={getCriticalRoll(critical.key) || null}
              onChange={(e) => onUpdateCriticalRoll(critical.key, e)}
              disabled={action.status === 'completed'}
            />
          </Grid>
          <Grid size={8}>
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
          <Grid size={4}></Grid>
          <Grid size={8}>{critical.result?.text || ''}</Grid>
        </Fragment>
      ))}
    </>
  );
};

export default ResolveAttackFormCriticals;
