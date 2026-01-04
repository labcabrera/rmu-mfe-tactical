import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { Stack, Grid } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { updateCriticalRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import Effect from '../../../shared/generic/Effect';
import { NumericInput } from '../../../shared/inputs/NumericInput';

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
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  return (
    <>
      {attack.results.criticals.map((critical: any, index: number) => (
        <Fragment key={index}>
          <Grid size={2} offset={2}>
            <NumericInput
              label={t('critical-roll')}
              value={getCriticalRoll(critical.key)}
              onChange={(e) => onUpdateCriticalRoll(critical.key, e)}
              disabled={action.status === 'completed'}
            />
          </Grid>
          <Grid size={8}>
            <Stack direction="row" spacing={1}>
              {critical.result && critical.result.damage && critical.result.damage > 0 && (
                <Effect effect={'dmg'} value={critical.result.damage} color="error" />
              )}
              {critical.result &&
                critical.result.effects &&
                critical.result.effects.length > 0 &&
                critical.result.effects.map((effect, effectIndex) => (
                  <Effect
                    key={effectIndex}
                    effect={effect.status}
                    rounds={effect.rounds}
                    value={effect.value}
                    color="error"
                  />
                ))}
            </Stack>
          </Grid>
          <Grid size={4}></Grid>
          <Grid size={8}>
            {critical.result?.text || ''}
            {critical.result?.location && <span>&nbsp;[{t(critical.result?.location)}]</span>}
          </Grid>
        </Fragment>
      ))}
    </>
  );
};

export default ResolveAttackFormCriticals;
