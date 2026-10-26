import React, { Dispatch, FC, Fragment, SetStateAction, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Stack, Grid, Typography } from '@mui/material';
import { CategorySeparator, D100, RollField } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { updateCriticalRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration, CriticalEffect } from '../../../api/action.dto';
import { criticalCode } from '../../../services/action-service';
import { useTacticalNotify } from '../../../services/notify-service';
import Effect from '../../../shared/generic/Effect';
import OptionTiles from '../attack-modifiers/pickers/OptionTiles';
import { CRITICAL_STYLE_OPTIONS, severityFeet, styleOptionsFor } from './style-critical-options';

const NO_OPTION = 'none';

const ResolveAttackFormCriticals: FC<{
  formData: AttackDeclaration;
  action: Action;
  index: number;
  attack: ActionAttack;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, action, index, attack, setFormData }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { updateAction, actorRounds } = useContext(CombatContext)!;
  const notify = useTacticalNotify();
  const [styleOption, setStyleOption] = useState(NO_OPTION);

  if (!formData || !formData.attacks || formData.attacks.length <= index) return null;

  const criticals = attack.results?.criticals ?? [];
  // §9.8: every critical of the attack uses the same roll (and location). The API resolves them all with the first
  // one and rejects a different roll, so a single input sends it under the first critical's key.
  const sharedRoll = Object.values(attack.roll?.criticalRolls ?? {}).find(
    (roll): roll is number => roll !== null && roll !== undefined
  );
  // Spec 032, group C: an option of the attacker's style can still change the criticals before the roll, unless
  // one was declared with the attack.
  const source = actorRounds?.find((ar) => ar.actorId === action.actorId);
  const declaredOption = attack.modifiers.styleCriticalOption;
  const styleOptions =
    sharedRoll === undefined && !declaredOption && criticals.length > 0
      ? styleOptionsFor(source, attack.attackName, CRITICAL_STYLE_OPTIONS)
      : [];

  const onUpdateCriticalRoll = (roll: number) => {
    if (criticals.length === 0) return;
    const option = styleOptions.includes(styleOption) ? styleOption : undefined;
    updateCriticalRoll(action.id, attack.attackName, criticals[0].key, roll, auth, option)
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
        <Grid size={12}>
          <CategorySeparator text={t('critical-roll')} />
        </Grid>
        {declaredOption && sharedRoll === undefined && (
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">
              {t('style-critical-option-declared', { ability: t(`style-ability-${declaredOption}`) })}
            </Typography>
          </Grid>
        )}
        {styleOptions.length > 0 && (
          <Grid size={12}>
            <OptionTiles
              label={t('style-critical-option')}
              options={[NO_OPTION, ...styleOptions].map((key) => ({ key, value: null }))}
              value={styleOption}
              optionLabel={(option) => (option.key === NO_OPTION ? t('none') : t(`style-ability-${option.key}`))}
              onChange={setStyleOption}
            />
          </Grid>
        )}
        <Grid size={6}>
          <RollField
            spec={D100}
            label={t('critical-roll')}
            value={sharedRoll}
            onChange={(roll) => onUpdateCriticalRoll(roll.total)}
            // Once stored it resolves every critical: it is not changed afterwards.
            disabled={action.status === 'completed' || sharedRoll !== undefined}
          />
        </Grid>
        <Grid size={6}>
          {criticals.length > 1 && (
            <Typography variant="caption" color="text.secondary">
              {t('critical-roll-shared', { count: criticals.length })}
            </Typography>
          )}
        </Grid>
        {criticals.map((critical, index) => (
          <Fragment key={index}>
            <Grid size={12}>
              <CategorySeparator
                text={t('critical-code', { code: criticalCode(critical.criticalType, critical.criticalSeverity) })}
              />
            </Grid>
            {critical.styleOption && (
              <Grid size={12}>
                <Alert severity="info" variant="outlined">
                  {t(`style-critical-effect-${critical.styleOption.abilityId}`, {
                    type: critical.styleOption.originalType,
                    severity: critical.styleOption.originalSeverity,
                    feet: severityFeet(critical.styleOption.originalSeverity),
                    roll: attack.calculated?.rollTotal ?? '-',
                  })}
                </Alert>
              </Grid>
            )}
            <Grid size={12}>
              <Stack>
                <Typography variant="h6">{critical.adjustedRoll}</Typography>
                <Typography variant="body2" color="secondary">
                  {t('total')}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={12}>
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
                  <Effect status={'dmg'} label={t('damage-n', { damage: critical.result.damage })} color="error" />
                )}
                {critical.result &&
                  critical.result.effects &&
                  critical.result.effects.length > 0 &&
                  critical.result.effects.map((effect, effectIndex) => (
                    <Effect key={effectIndex} label={getStatusLabel(effect)} color="error" status={effect.status} />
                  ))}
              </Stack>
            </Grid>
            <Grid size={12}>{critical.result?.text || ''}</Grid>
          </Fragment>
        ))}
      </Grid>
    </>
  );
};

export default ResolveAttackFormCriticals;
