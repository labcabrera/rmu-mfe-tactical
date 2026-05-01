import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Grid, Stack } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { updateFumbleRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import Effect from '../../../shared/generic/Effect';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';

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
  const { showError } = useError();
  const fumble = attack.results?.fumble;

  if (!formData || !formData.attacks || formData.attacks.length <= index) return <div>Loading...</div>;

  const onUpdateFumbleRoll = (roll: number) => {
    updateFumbleRoll(action.id, attack.attackName, roll, auth)
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

  const getEffectLabel = (effect: any) => {
    //TODO
    return `${effect.status} ${effect.value || ''}`;
  };

  return (
    <>
      <Grid size={2} offset={2}>
        <NumericInput
          label={t('fumble-roll')}
          value={attack.roll!.fumbleRoll || null}
          onChange={(e) => onUpdateFumbleRoll(e)}
          disabled={action.status === 'completed'}
        />
      </Grid>
      <Grid size={8}>
        <Stack direction="row" spacing={1}>
          {fumble.result && fumble.result.damage && fumble.result.damage > 0 && (
            <Effect status={'dmg'} label={`${fumble.result.damage}`} color="error" />
          )}
          {fumble.effects &&
            fumble.effects.length > 0 &&
            fumble.effects.map((effect, index) => (
              <Effect key={index} status={effect.status} label={getEffectLabel(effect)} color="error" />
            ))}
        </Stack>
      </Grid>
      <Grid size={8} offset={4}>
        {fumble?.text || ''}
      </Grid>
    </>
  );
};

export default ResolveAttackFormFumble;
