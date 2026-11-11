import { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Stack, Tab, Tabs } from '@mui/material';
import { formatBonus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound } from '../../../combat/combat-context';
import { chargeFor } from '../../../services/movement-service';
import UnresolvedMovementNotice from '../../../shared/movement/UnresolvedMovementNotice';
import AttackModifiersForm from './modifiers/AttackModifiersForm';
import SpecialManeuverFields from './modifiers/SpecialManeuverFields';
import StyleCriticalOptionPicker from './modifiers/StyleCriticalOptionPicker';
import { AttackKind } from './useAttackDeclaration';

/** The modifiers of the attacks shown, one tab per weapon, and the notices that apply to them. */
const AttackModifiersStep: FC<{
  action: Action;
  actorRound: ActorRound;
  kind: AttackKind;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  attacksShown: AttackDeclaration['attacks'];
  shownTab: number;
  onTab: (tab: number) => void;
  unprepared: boolean;
  labelOf: (attackName: string) => string;
  target: ActorRound | undefined;
  chargeFear: string | undefined;
  freePace: string | undefined;
  strayShotNotice: ReactNode;
}> = ({
  action,
  actorRound,
  kind,
  formData,
  setFormData,
  attacksShown,
  shownTab,
  onTab,
  unprepared,
  labelOf,
  target,
  chargeFear,
  freePace,
  strayShotNotice,
}) => {
  const { t } = useTranslation();
  const { game } = useCombatGame();
  const { roundActions } = useCombatRound();
  // Table 8-2: the distance behind the charge the declaration pre-selected (useAttackDeclaration)
  const charge = game && kind === 'melee' ? chargeFor(actorRound, roundActions ?? [], game.round) : undefined;
  const chargeHelp = charge
    ? t('charge-moved-distance', { moved: Math.round(charge.moved), times: (charge.moved / charge.bmr).toFixed(1) })
    : undefined;
  return (
    <Stack spacing={1.5}>
      {attacksShown.length > 1 && (
        <Tabs value={shownTab} onChange={(_, value: number) => onTab(value)}>
          {attacksShown.map((a) => (
            <Tab key={a.attackName} label={labelOf(a.attackName)} />
          ))}
        </Tabs>
      )}
      {action.reaction && unprepared && (
        <Alert severity="info" variant="outlined">
          {action.reaction.obOverride === null || action.reaction.obOverride === undefined
            ? t('reaction-attack-help', { trait: t(action.reaction.traitId) })
            : t('reaction-attack-help-ob', {
                trait: t(action.reaction.traitId),
                ob: formatBonus(action.reaction.obOverride),
              })}
        </Alert>
      )}
      {strayShotNotice}
      {chargeFear && unprepared && (
        <Alert severity={chargeFear === 'fear-retreat' ? 'warning' : 'info'} variant="outlined">
          {t(`fear-charge-${chargeFear}`)}
        </Alert>
      )}
      {unprepared && <UnresolvedMovementNotice action={action} />}
      {freePace && unprepared && (
        <Alert severity="info" variant="outlined">
          {t('free-movement-attack-pace', { pace: t(freePace) })}
        </Alert>
      )}
      <AttackModifiersForm
        formData={formData}
        setFormData={setFormData}
        index={formData.attacks.findIndex((a) => a.attackName === attacksShown[shownTab].attackName)}
        kind={kind}
        target={target}
        attackerTraits={actorRound.traits?.map((trait) => trait.traitId)}
        fieldHelp={chargeHelp ? { chargeSpeed: chargeHelp } : undefined}
        specialExtra={
          unprepared && !action.strayShot ? (
            <SpecialManeuverFields
              formData={formData}
              setFormData={setFormData}
              index={formData.attacks.findIndex((a) => a.attackName === attacksShown[shownTab].attackName)}
              kind={kind}
              spell={action.actionType === 'cast_spell'}
              sourceActorId={action.actorId}
            />
          ) : undefined
        }
      />
      {unprepared && (
        <StyleCriticalOptionPicker
          actorRound={actorRound}
          formData={formData}
          setFormData={setFormData}
          attackName={attacksShown[shownTab].attackName}
        />
      )}
    </Stack>
  );
};

export default AttackModifiersStep;
