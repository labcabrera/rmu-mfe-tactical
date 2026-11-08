import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ReplayIcon from '@mui/icons-material/Replay';
import { Alert, Button, Stack, Tooltip, Typography } from '@mui/material';
import {
  ChipRow,
  D100,
  effectColor,
  effectIcon,
  RmuChip,
  RollCard,
  RollField,
  useTableText,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { updateCriticalRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration, CriticalEffect } from '../../../api/action.dto';
import { criticalCode } from '../../../services/action-service';
import { criticalRerollKind } from '../../../services/combat-talents-service';
import { useTacticalNotify } from '../../../services/notify-service';
import OptionTiles from '../attack-modifiers/pickers/OptionTiles';
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
  // Workspace spec 086: the English text of a table entry, translated when there is one
  const tableText = useTableText();
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
  // Workspace spec 077, B2: against armor by location, the critical roll sent with the attack fixed the location and
  // the criticals are rolled with it (another roll is err-critical-roll-location-fixed; a reroll keeps the location).
  const locationRoll = attack.calculated?.locationRoll;
  const fixedByLocation = locationRoll !== undefined && locationRoll !== null;

  const rollField =
    fixedByLocation && sharedRoll === undefined ? (
      <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="body2">{t('critical-roll-from-location', { roll: locationRoll })}</Typography>
        <Button
          size="small"
          variant="contained"
          disabled={action.status === 'completed'}
          onClick={() => onUpdateCriticalRoll(locationRoll!)}
        >
          {t('critical-roll-apply', { roll: locationRoll })}
        </Button>
      </Stack>
    ) : (
      <RollField
        spec={D100}
        label={t('critical-roll')}
        value={sharedRoll}
        onChange={(roll) => onUpdateCriticalRoll(roll.total)}
        // Each roll resolves every critical again; it can change until the attack is applied. Once rolled again
        // with a critical-reroll effect, the second roll counts (workspace spec 076). A roll that fixed the
        // location of the attack (spec 077) cannot change.
        disabled={action.status === 'completed' || !!originalRoll || fixedByLocation}
      />
    );

  // Workspace spec 085, 2.4: one card for the shared roll, with each critical it resolves below
  return (
    <RollCard
      title={t('critical-roll')}
      status={sharedRoll === undefined ? 'pending' : 'done'}
      statusText={
        sharedRoll === undefined
          ? criticals.length > 1
            ? t('critical-roll-shared', { count: criticals.length })
            : t('attack-next-step-pending_critical_roll')
          : undefined
      }
      field={rollField}
    >
      {declaredOption && sharedRoll === undefined && (
        <Typography variant="body2" color="text.secondary">
          {t('style-critical-option-declared', { ability: t(`style-ability-${declaredOption}`) })}
        </Typography>
      )}
      {styleOptions.length > 0 && (
        <OptionTiles
          label={t('style-critical-option')}
          options={[NO_OPTION, ...styleOptions].map((key) => ({ key, value: null }))}
          value={styleOption}
          optionLabel={(option) => (option.key === NO_OPTION ? t('none') : t(`style-ability-${option.key}`))}
          onChange={setStyleOption}
        />
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
      {rerollKind && rerolling && (
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
      )}
      {sharedRoll !== undefined &&
        criticals.map((critical, index) => (
          <Stack key={index} spacing={0.75} sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline' }}>
              {/* Workspace spec 085, 1.8: one critical is already named by the chip of the attack roll */}
              {criticals.length > 1 && (
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {t('critical-code', { code: criticalCode(critical.criticalType, critical.criticalSeverity) })}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {t('critical-adjusted-roll', { roll: critical.adjustedRoll ?? '-' })}
              </Typography>
            </Stack>
            {critical.styleOption && (
              <Alert severity="info" variant="outlined">
                {t(`style-critical-effect-${critical.styleOption.abilityId}`, {
                  type: critical.styleOption.originalType,
                  severity: critical.styleOption.originalSeverity,
                  feet: severityFeet(critical.styleOption.originalSeverity),
                  roll: attack.calculated?.rollTotal ?? '-',
                })}
              </Alert>
            )}
            <ChipRow>
              {!!critical.result?.damage && critical.result.damage > 0 && (
                <RmuChip
                  variant="outcome"
                  tone="error"
                  hint={t('dmg')}
                  avatar={effectIcon('dmg')}
                  label={t('damage-n', { damage: critical.result.damage })}
                />
              )}
              {(critical.result?.effects ?? []).map((effect, effectIndex) => (
                <Tooltip key={effectIndex} title={t(effect.status)}>
                  <RmuChip
                    variant="effect"
                    tone={effectColor(effect.status)}
                    avatar={effectIcon(effect.status)}
                    label={getStatusLabel(effect)}
                  />
                </Tooltip>
              ))}
            </ChipRow>
            {critical.result?.text && <Typography variant="body2">{tableText(critical.result.text)}</Typography>}
          </Stack>
        ))}
    </RollCard>
  );
};

export default ResolveAttackFormCriticals;
