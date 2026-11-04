import React, { Dispatch, FC, Fragment, SetStateAction, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ReplayIcon from '@mui/icons-material/Replay';
import { Alert, Button, Chip, Grid, Stack, Tooltip, Typography } from '@mui/material';
import { CategorySeparator, ChipRow, D100, effectIcon, RollField } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { updateCriticalRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration, CriticalEffect } from '../../../api/action.dto';
import { criticalCode } from '../../../services/action-service';
import { criticalRerollKind } from '../../../services/combat-talents-service';
import { useTacticalNotify } from '../../../services/notify-service';
import OptionTiles from '../attack-modifiers/pickers/OptionTiles';
import { SeverityShiftChip, severityChanged } from './attack-size-results';
import { criticalEffectLabel } from './critical-effect-label';
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
  const { updateAction, actorRounds, refreshActorRounds } = useContext(CombatContext)!;
  const notify = useTacticalNotify();
  const [styleOption, setStyleOption] = useState(NO_OPTION);
  const [rerolling, setRerolling] = useState(false);

  if (!formData || !formData.attacks || formData.attacks.length <= index) return null;

  const criticals = attack.results?.criticals ?? [];
  // §9.8: every critical of the attack uses the same roll (and location). The API resolves them all with it, so a
  // single input sends it under the first critical's key.
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

  // Workspace spec 076, decision B8: a critical already rolled can be rolled again once, before the attack is applied,
  // by an attacker with Sense Weakness against the target or a target with Study Offense against the attacker.
  const target = actorRounds?.find((ar) => ar.actorId === attack.modifiers.targetId);
  const originalRoll = criticals.find(
    (critical) => critical.originalRoll !== null && critical.originalRoll !== undefined
  );
  const rerollKind =
    sharedRoll !== undefined && !originalRoll && action.status !== 'completed'
      ? criticalRerollKind(source, target)
      : undefined;

  const onUpdateCriticalRoll = (roll: number, reroll = false) => {
    if (criticals.length === 0) return;
    const option = !reroll && styleOptions.includes(styleOption) ? styleOption : undefined;
    updateCriticalRoll(action.id, attack.attackName, criticals[0].key, roll, auth, option, reroll)
      .then((currentAction) => {
        const newFormData = { attacks: currentAction.attacks || [], parries: currentAction.parries || [] };
        updateAction(currentAction);
        setFormData(newFormData);
        setRerolling(false);
        // The reroll used up the effect of the actor that had it
        if (reroll) refreshActorRounds();
      })
      .catch((err) => notify.error(err));
  };

  const getStatusLabel = (effect: CriticalEffect) => criticalEffectLabel(effect, t);

  return (
    <>
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid size={12}>
          <CategorySeparator text={t('critical-roll')} />
        </Grid>
        {severityChanged(attack.results?.severityAdjustment) && attack.results.severityAdjustment.final && (
          // The table's critical moved by the sizes, the charge and the style (spec 075)
          <Grid size={12}>
            <SeverityShiftChip
              criticalType={attack.results.attackTableEntry?.criticalType ?? criticals[0]?.criticalType}
              adjustment={attack.results.severityAdjustment}
            />
          </Grid>
        )}
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
            // Each roll resolves every critical again; it can change until the attack is applied. Once rolled again
            // with a critical-reroll effect, the second roll counts (workspace spec 076).
            disabled={action.status === 'completed' || !!originalRoll}
          />
        </Grid>
        <Grid size={6}>
          <Stack spacing={0.5}>
            {criticals.length > 1 && (
              <Typography variant="caption" color="text.secondary">
                {t('critical-roll-shared', { count: criticals.length })}
              </Typography>
            )}
            {originalRoll && (
              <Typography variant="body2" color="text.secondary">
                {t('critical-original-roll')}{' '}
                <Typography component="span" variant="body2" sx={{ textDecoration: 'line-through' }}>
                  {originalRoll.originalRoll}
                </Typography>
                {originalRoll.rerolledBy && ` · ${t(`critical-rerolled-by-${originalRoll.rerolledBy}`)}`}
              </Typography>
            )}
            {rerollKind && !rerolling && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={() => setRerolling(true)}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('critical-reroll-button', {
                  talent: t(rerollKind === 'offense' ? 'sense-weakness' : 'study-offense'),
                })}
              </Button>
            )}
          </Stack>
        </Grid>
        {rerollKind && rerolling && (
          <Grid size={12}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <RollField
                spec={D100}
                label={t('critical-reroll-roll')}
                value={null}
                onChange={(roll) => onUpdateCriticalRoll(roll.total, true)}
              />
              <Button size="small" onClick={() => setRerolling(false)}>
                {t('cancel')}
              </Button>
            </Stack>
          </Grid>
        )}
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
              <ChipRow>
                {!!critical.result?.damage && critical.result.damage > 0 && (
                  <Tooltip title={t('dmg')}>
                    <Chip
                      avatar={effectIcon('dmg')}
                      label={t('damage-n', { damage: critical.result.damage })}
                      color="error"
                    />
                  </Tooltip>
                )}
                {critical.result &&
                  critical.result.effects &&
                  critical.result.effects.length > 0 &&
                  critical.result.effects.map((effect, effectIndex) => (
                    <Tooltip key={effectIndex} title={t(effect.status)}>
                      <Chip avatar={effectIcon(effect.status)} label={getStatusLabel(effect)} color="error" />
                    </Tooltip>
                  ))}
              </ChipRow>
            </Grid>
            <Grid size={12}>{critical.result?.text || ''}</Grid>
          </Fragment>
        ))}
      </Grid>
    </>
  );
};

export default ResolveAttackFormCriticals;
