import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Chip, Grid, Stack, Tooltip, Typography } from '@mui/material';
import {
  CategorySeparator,
  ChipRow,
  D100,
  effectIcon,
  HIGH_OPEN_D100,
  RollField,
  RollValue,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { updateAttackRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { criticalCode } from '../../../services/action-service';
import { useNotifyWarnings } from '../../../services/action-warnings';
import { actorOpenEnded } from '../../../services/combat-talents-service';
import { useTacticalNotify } from '../../../services/notify-service';
import { AttackNextStep, AttackResultSummary } from './AttackResolutionGuide';
import ResolveAttackFormCriticals from './ResolveAttackFormCriticals';
import ResolveAttackFormFumble from './ResolveAttackFormFumble';
import ResolveAttackInfo from './ResolveAttackInfo';
import SpecialManeuverResult from './SpecialManeuverResult';
import { CriticalRemovedAlert, SeverityShiftChip, severityChanged, useDamageText } from './attack-size-results';

/**
 * The target wears armor by location (workspace spec 077, B2): its AT depends on where the attack hits, so without a
 * called shot the attack roll goes with the critical roll that decides the location.
 */
export const needsLocationRoll = (attack: ActionAttack, target: ActorRound | undefined): boolean =>
  !!target && target.defense?.at === null && (!attack.modifiers.calledShot || attack.modifiers.calledShot === 'none');

/** AT of a target with armor by location at a location of Table 9-5 (head, chest, abdomen, arms, legs). */
export const locationArmorType = (target: ActorRound | undefined, location: string | null | undefined) => {
  if (!target || !location) return undefined;
  const defense = target.defense;
  if (location === 'head') return defense.headAt;
  if (location === 'arms') return defense.armsAt;
  if (location === 'legs') return defense.legsAt;
  return defense.bodyAt;
};

const ResolveAttackFormRoll: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  action: Action;
  attack: ActionAttack;
  index: number;
}> = ({ formData, setFormData, action, attack, index }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { updateAction, actorRounds, refreshRound } = useContext(CombatContext)!;
  const notify = useTacticalNotify();
  const notifyWarnings = useNotifyWarnings();
  const damageText = useDamageText();
  const isCompleted = action.status === 'completed';
  // Workspace spec 076: the API checks the dice against the attacker's roll profile (luck talents)
  const openEnded = actorOpenEnded(actorRounds?.find((actorRound) => actorRound.actorId === action.actorId));
  const target = actorRounds?.find((actorRound) => actorRound.actorId === attack.modifiers?.targetId);
  const [criticalRoll, setCriticalRoll] = useState<number | null>(attack.calculated?.locationRoll ?? null);

  if (!formData || !formData.attacks || formData.attacks.length <= index) return null;

  if (!attack.calculated) return <p>{t('attack-not-calculated')}</p>;

  // Workspace spec 077, B2: against armor by location without a called shot, the critical roll (1-100) is rolled with
  // the attack: its location decides the AT, and it stays fixed for the criticals. Otherwise the AT is the target's.
  // The attack is a high open-ended d100, and its first die decides the fumble (spec 056).
  const locationRollNeeded = needsLocationRoll(attack, target);
  const locationFixed = attack.calculated.locationRoll !== undefined && attack.calculated.locationRoll !== null;
  const locationAt = locationArmorType(target, attack.calculated.location);
  const onRollChange = (roll: RollValue) => {
    // Nothing changed since the last stored roll.
    if (roll.total === attack.roll?.roll && roll.unmodified === attack.roll?.unmodified) return;
    updateAttackRoll(
      action.id,
      attack.attackName,
      roll.total,
      roll.unmodified,
      roll.rolls,
      auth,
      locationRollNeeded ? (criticalRoll ?? undefined) : undefined
    )
      .then((updatedAction) => {
        const newFormData = { attacks: updatedAction.attacks, parries: updatedAction.parries } as AttackDeclaration;
        updateAction(updatedAction);
        setFormData(newFormData);
        // Workspace spec 083: from its first roll the OB of the action counts.
        refreshRound();
        notifyWarnings(updatedAction.warnings);
      })
      .catch((err: Error) => notify.error(err));
  };

  const isCriticalAttack = (): boolean => {
    return attack.results?.criticals !== undefined && attack.results.criticals.length > 0;
  };

  const isFumbleAttack = (): boolean => !!attack.results?.fumble;

  const getCriticalText = (): string => {
    const entry = attack.results?.attackTableEntry;
    if (!entry || !entry.criticalType) return '';
    return t('critical-code', { code: criticalCode(entry.criticalType, entry.criticalSeverity) });
  };

  const getAbsoluteHitText = (totalRoll: number) => {
    return t('absolute-hit-bonus', { bonus: Math.ceil((totalRoll - 175) / 5) });
  };

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <ResolveAttackInfo attack={formData.attacks[index]} sourceActorId={action.actorId} />
      </Grid>
      <Grid size={12}>
        <AttackNextStep attack={attack} />
      </Grid>
      <Grid size={12}>
        {attack.calculated.location && (
          <Grid size={8}>
            <Chip
              size="medium"
              color="error"
              label={
                locationAt !== undefined && target?.defense?.at === null
                  ? t('attack-location-at', { location: t(attack.calculated.location), at: locationAt })
                  : t(attack.calculated.location)
              }
            />
          </Grid>
        )}
      </Grid>
      <Grid size={12}>
        <CategorySeparator text={t('attack-roll')} />
      </Grid>
      {locationRollNeeded && (
        <Grid size={12}>
          <Stack spacing={0.5}>
            <RollField
              spec={D100}
              label={t('attack-location-roll')}
              value={criticalRoll}
              onChange={(roll) => setCriticalRoll(roll.total)}
              onClear={() => setCriticalRoll(null)}
              // Once stored it decides the location and the criticals: it cannot change.
              disabled={isCompleted || locationFixed}
            />
            <Typography variant="caption" color="text.secondary">
              {t('attack-location-roll-help')}
            </Typography>
          </Stack>
        </Grid>
      )}
      <Grid size={7}>
        <RollField
          spec={HIGH_OPEN_D100}
          label={t('attack-roll')}
          value={attack.roll?.roll ?? null}
          disabled={isCompleted || (locationRollNeeded && criticalRoll === null && !attack.roll?.roll)}
          onChange={onRollChange}
          openEnded={openEnded}
        />
      </Grid>
      <Grid size={5}>
        <Stack>
          <Typography variant="h6">{attack.calculated.rollTotal}</Typography>
          <Typography variant="body2" color="secondary">
            {t('total')}
          </Typography>
          {attack.calculated.fumble !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {t('fumble-range-n', { fumble: attack.calculated.fumble })}
            </Typography>
          )}
        </Stack>
      </Grid>
      <Grid size={12}>
        {attack.results && attack.results.attackTableEntry && (
          <ChipRow>
            {attack.results.attackTableEntry.damage > 0 ? (
              <Tooltip title={t('dmg')}>
                <Chip
                  avatar={effectIcon('dmg')}
                  label={t('damage-n', {
                    damage: damageText(attack.results.attackTableEntry.damage, attack.results.damageAdjustment),
                  })}
                  color="error"
                />
              </Tooltip>
            ) : (
              <Typography>{t('no-damage')}</Typography>
            )}
            {severityChanged(attack.results.severityAdjustment) ? (
              <SeverityShiftChip
                criticalType={
                  attack.results.attackTableEntry.criticalType ?? attack.results.criticals?.[0]?.criticalType
                }
                adjustment={attack.results.severityAdjustment}
              />
            ) : (
              attack.results.attackTableEntry.criticalType && <Chip label={getCriticalText()} color="error" />
            )}
            {attack.calculated.rollTotal > 175 && !attack.disarm && (
              <Chip label={getAbsoluteHitText(attack.calculated.rollTotal)} color="error" />
            )}
          </ChipRow>
        )}
      </Grid>
      {(attack.disarm || attack.results?.subdualAdjustment) && (
        <Grid size={12}>
          <SpecialManeuverResult attack={attack} />
        </Grid>
      )}
      {attack.results?.severityAdjustment?.final === null && (
        <Grid size={12}>
          <CriticalRemovedAlert adjustment={attack.results.severityAdjustment} />
        </Grid>
      )}

      {isCriticalAttack() && (
        <Grid size={12}>
          <ResolveAttackFormCriticals
            attack={attack}
            formData={formData}
            setFormData={setFormData}
            action={action}
            index={index}
          />
        </Grid>
      )}
      {isFumbleAttack() && (
        <Grid size={12}>
          <ResolveAttackFormFumble
            attack={attack}
            formData={formData}
            setFormData={setFormData}
            action={action}
            index={index}
          />
        </Grid>
      )}
      <Grid size={12}>
        <AttackResultSummary
          attack={attack}
          targetName={actorRounds?.find((actorRound) => actorRound.actorId === attack.modifiers?.targetId)?.actorName}
        />
      </Grid>
    </Grid>
  );
};

export default ResolveAttackFormRoll;
