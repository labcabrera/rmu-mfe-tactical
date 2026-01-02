import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { updateFumbleRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { NumericInput } from '../../../shared/inputs/NumericInput';

const ResolveAttackFormFumble: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  action: Action;
  index: number;
  attack: ActionAttack;
}> = ({ formData, setFormData, action, index, attack }) => {
  const { updateAction } = useContext(CombatContext);
  const [fumbleRoll, setFumbleRoll] = useState<number | null>(attack.roll?.fumbleRoll || null);
  const { showError } = useError();

  if (!formData || !formData.attacks || formData.attacks.length <= index) return <div>Loading...</div>;

  const onUpdateFumbleRollClick = () => {
    updateFumbleRoll(action.id, attack.attackName, fumbleRoll)
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

  return (
    <>
      <Grid size={2}>
        <Button
          variant="contained"
          size="small"
          color="success"
          disabled={!fumbleRoll}
          onClick={() => onUpdateFumbleRollClick()}
        >
          {t('roll-fumble')}
        </Button>
      </Grid>
      <Grid size={1}>
        <NumericInput label={t('fumble-roll')} value={fumbleRoll} onChange={(e) => setFumbleRoll(e)} />
      </Grid>
      {/* <Grid size={1}>
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
      </Grid> */}
      <Grid size={12}></Grid>
    </>
  );
};

export default ResolveAttackFormFumble;
