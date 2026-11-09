import { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid, Stack, Typography } from '@mui/material';
import {
  ChipRow,
  D100,
  effectIcon,
  HIGH_OPEN_D100,
  RmuChip,
  RollCard,
  RollCardStatus,
  RollField,
  RollValue,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { updateAttackRoll } from '../../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../../api/action.dto';
import { ActorRound } from '../../../../api/actor-rounds.dto';
import { useCombatRound, useCombatActions } from '../../../../combat/combat-context';
import { useNotifyWarnings } from '../../../../hooks/useActionWarnings';
import { criticalCode } from '../../../../services/action-service';
import { actorOpenEnded } from '../../../../services/combat-talents-service';
import BreakdownColumns from '../BreakdownColumns';
import { AttackResultSummary } from './AttackResolutionGuide';
import ResolveAttackFormCriticals from './ResolveAttackFormCriticals';
import ResolveAttackFormFumble from './ResolveAttackFormFumble';
import ResolveAttackInfo from './ResolveAttackInfo';
import SpecialManeuverResult from './SpecialManeuverResult';
import { CriticalRemovedAlert, SeverityShiftChip, severityChanged, useDamageText } from './attack-size-results';

/**
 * The target wears armor by location (workspace spec 077, B2): its AT depends on where the attack hits, so without a
 * called shot the attack roll goes with the critical roll that decides the location.
 */
const needsLocationRoll = (attack: ActionAttack, target: ActorRound | undefined): boolean =>
  !!target && target.defense?.at === null && (!attack.modifiers.calledShot || attack.modifiers.calledShot === 'none');

/** AT of a target with armor by location at a location of Table 9-5 (head, chest, abdomen, arms, legs). */
const locationArmorType = (target: ActorRound | undefined, location: string | null | undefined) => {
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
  const { actorRounds } = useCombatRound();
  const { updateAction, refreshRound } = useCombatActions();
  const notify = useApiNotify();
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

  // Workspace spec 085, 1.10: the fumble range matters only when the roll falls in it or close to it
  const firstDie = attack.roll?.unmodified ?? attack.roll?.roll;
  const fumbleNear =
    attack.calculated.fumble !== undefined &&
    firstDie !== null &&
    firstDie !== undefined &&
    firstDie <= attack.calculated.fumble + 10;

  const rolled = attack.roll?.roll !== null && attack.roll?.roll !== undefined;
  const rollStatus: RollCardStatus = !rolled
    ? 'pending'
    : attack.status === 'pending_critical_roll' || attack.status === 'pending_fumble_roll'
      ? 'attention'
      : 'done';

  const getAbsoluteHitText = (totalRoll: number) => {
    return t('absolute-hit-bonus', { bonus: Math.ceil((totalRoll - 175) / 5) });
  };

  return (
    <BreakdownColumns breakdown={<ResolveAttackInfo attack={formData.attacks[index]} sourceActorId={action.actorId} />}>
      <Grid container spacing={1}>
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
        <Grid size={12}>
          {/* Workspace spec 085, 2.4: the roll, its status, its total and what it gives in one card */}
          <RollCard
            title={t('attack-roll')}
            status={rollStatus}
            statusText={
              rollStatus === 'done' ? undefined : t(`attack-next-step-${attack.status ?? 'pending_attack_roll'}`)
            }
            field={
              <RollField
                spec={HIGH_OPEN_D100}
                label={t('attack-roll')}
                value={attack.roll?.roll ?? null}
                disabled={isCompleted || (locationRollNeeded && criticalRoll === null && !attack.roll?.roll)}
                onChange={onRollChange}
                openEnded={openEnded}
              />
            }
            total={attack.calculated.rollTotal}
            totalLabel={rolled ? t('total') : t('predicted-total')}
            caption={fumbleNear ? t('fumble-range-n', { fumble: attack.calculated.fumble }) : undefined}
            chips={
              (attack.calculated.location || (attack.results && attack.results.attackTableEntry)) && (
                <ChipRow>
                  {attack.calculated.location && (
                    <RmuChip
                      variant="outcome"
                      label={
                        locationAt !== undefined && target?.defense?.at === null
                          ? t('attack-location-at', { location: t(attack.calculated.location), at: locationAt })
                          : t(attack.calculated.location)
                      }
                    />
                  )}
                  {attack.results?.attackTableEntry &&
                    (attack.results.attackTableEntry.damage > 0 ? (
                      <RmuChip
                        variant="outcome"
                        tone="error"
                        hint={t('dmg')}
                        avatar={effectIcon('dmg')}
                        label={t('damage-n', {
                          damage: damageText(attack.results.attackTableEntry.damage, attack.results.damageAdjustment),
                        })}
                      />
                    ) : (
                      <RmuChip variant="outcome" label={t('no-damage')} />
                    ))}
                  {attack.results?.attackTableEntry &&
                    (severityChanged(attack.results.severityAdjustment) ? (
                      <SeverityShiftChip
                        criticalType={
                          attack.results.attackTableEntry.criticalType ?? attack.results.criticals?.[0]?.criticalType
                        }
                        adjustment={attack.results.severityAdjustment}
                      />
                    ) : (
                      attack.results.attackTableEntry.criticalType && (
                        <RmuChip variant="outcome" tone="error" label={getCriticalText()} />
                      )
                    ))}
                  {attack.results?.attackTableEntry && attack.calculated.rollTotal > 175 && !attack.disarm && (
                    <RmuChip variant="outcome" tone="error" label={getAbsoluteHitText(attack.calculated.rollTotal)} />
                  )}
                </ChipRow>
              )
            }
          />
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
            withTexts={false}
            attack={attack}
            targetName={actorRounds?.find((actorRound) => actorRound.actorId === attack.modifiers?.targetId)?.actorName}
          />
        </Grid>
      </Grid>
    </BreakdownColumns>
  );
};

export default ResolveAttackFormRoll;
