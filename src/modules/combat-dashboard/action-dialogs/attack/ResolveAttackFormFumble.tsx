import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, TextField, Grid } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { updateCriticalRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import Effect from '../../../shared/generic/Effect';
import { NumericInput } from '../../../shared/inputs/NumericInput';

const ResolveAttackFormFumble: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  action: Action;
  index: number;
  attack: ActionAttack;
}> = ({ formData, setFormData, action, index, attack }) => {
  const { updateAction } = useContext(CombatContext);
  const { showError } = useError();
  const { t } = useTranslation();

  if (!formData || !formData.attacks || formData.attacks.length <= index) return <div>Loading...</div>;

  if (!attack.results || !attack.results.criticals || attack.results.criticals.length === 0) return;

  const getCriticalRoll = (criticalKey: string): number | undefined => {
    let roll: number | undefined;
    try {
      roll = attack.roll!.criticalRolls[criticalKey];
    } catch (e) {
      console.error(e);
    }
    return roll;
  };

  const onUpdateCriticalRollClick = (criticalKey: string) => {
    updateCriticalRoll(action.id, attack.attackName, criticalKey, getCriticalRoll(criticalKey)!)
      .then((updatedAction) => {
        const newFormData = { attacks: updatedAction.attacks, parries: undefined };
        updateAction(updatedAction);
        //TODO fix types when model is updated
        setFormData(newFormData as any);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  const onUpdateCriticalRoll = (criticalKey: string, roll: number) => {
    const updated = { ...formData };
    if (updated.attacks && updated.attacks[index]) {
      if (!updated.attacks[index].roll) {
        updated.attacks[index].roll = { roll: null, location: null };
      } else {
        updated.attacks[index].roll = { ...updated.attacks[index].roll };
      }
      updated.attacks[index].roll.criticalRolls = {
        ...updated.attacks[index].roll.criticalRolls,
        [criticalKey]: roll,
      };
      setFormData(updated);
    }
  };

  return (
    <>
      {attack.results.criticals.map((critical: any, index: number) => (
        <Fragment key={index}>
          <Grid size={2}>
            <Button
              variant="contained"
              size="small"
              color="success"
              disabled={!getCriticalRoll(critical.key)}
              onClick={() => onUpdateCriticalRollClick(critical.key)}
            >
              {t('roll-fumble')}
            </Button>
          </Grid>
          <Grid size={1}>
            <NumericInput
              label={t('fumble-roll')}
              value={getCriticalRoll(critical.key)}
              onChange={(e) => onUpdateCriticalRoll(critical.key, e)}
            />
          </Grid>
          <Grid size={1}>
            <TextField label={t('type')} value={critical.criticalType} variant="standard" fullWidth />
          </Grid>
          <Grid size={1}>
            <TextField label={t('severity')} value={critical.criticalSeverity} variant="standard" fullWidth />
          </Grid>
          <Grid size={5}>{critical.result?.text || ''}</Grid>
          <Grid size={5}></Grid>
          <Grid size={7}>
            <Stack direction="row" spacing={1}>
              {critical.result && critical.result.damage && critical.result.damage > 0 && (
                <Effect effect={'dmg'} value={critical.result.damage} />
              )}
              {critical.result &&
                critical.result.effects &&
                critical.result.effects.length > 0 &&
                critical.result.effects.map((effect, effectIndex) => (
                  <Effect key={effectIndex} effect={effect.status} rounds={effect.rounds} value={effect.value} />
                ))}
            </Stack>
          </Grid>
          <Grid size={12}></Grid>
        </Fragment>
      ))}
    </>
  );
};

export default ResolveAttackFormFumble;
