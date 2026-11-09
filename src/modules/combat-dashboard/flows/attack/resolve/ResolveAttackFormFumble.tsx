import { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Stack, Tooltip, Typography } from '@mui/material';
import {
  ChipRow,
  D100,
  effectColor,
  effectIcon,
  RmuChip,
  RollCard,
  RollField,
  RollSpec,
  useApiNotify,
  useTableText,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { updateFumbleRoll } from '../../../../api/action';
import { Action, ActionAttack, AttackDeclaration, CriticalEffect } from '../../../../api/action.dto';
import { useCombatActions } from '../../../../combat/combat-context';
import { criticalEffectLabel } from './critical-effect-label';

/** The dice of the hits of a fumble entry (`2d10`) as a roll, undefined when its hits are fixed or it has none. */
const hitsSpec = (effects: CriticalEffect[] | undefined): { dice: string; spec: RollSpec } | undefined => {
  const dice = effects?.find((effect) => effect.status === 'hits' && effect.dice)?.dice;
  const match = dice ? /^(\d+)d(\d+)$/.exec(dice) : null;
  return match
    ? { dice: dice!, spec: { dice: Number(match[1]), sides: Number(match[2]), openEnded: 'none' } }
    : undefined;
};

const ResolveAttackFormFumble: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  action: Action;
  index: number;
  attack: ActionAttack;
}> = ({ formData, setFormData, action, index, attack }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  // Workspace spec 086: the English text of a table entry, translated when there is one
  const tableText = useTableText();
  const { updateAction } = useCombatActions();
  const notify = useApiNotify();
  const fumble = attack.results?.fumble;

  if (!formData || !formData.attacks || formData.attacks.length <= index || !fumble) return null;

  // Spec 034: the API rolls the dice of the hits; the game master can give the sum of a roll of their own instead.
  const hits = hitsSpec(fumble.effects);

  const onUpdateFumbleRoll = (roll: number, fumbleHits?: number) => {
    updateFumbleRoll(action.id, attack.attackName, roll, auth, fumbleHits)
      .then((currentAction) => {
        const newFormData = { attacks: currentAction.attacks || [], parries: currentAction.parries || [] };
        updateAction(currentAction);
        setFormData(newFormData);
      })
      .catch((err) => notify.error(err));
  };

  const rolled = attack.roll?.fumbleRoll !== null && attack.roll?.fumbleRoll !== undefined;
  // Workspace spec 085, 2.4: the fumble roll in the same card as the other rolls
  return (
    <RollCard
      title={t('fumble-roll')}
      status={rolled ? 'done' : 'attention'}
      statusText={rolled ? undefined : t('attack-next-step-pending_fumble_roll')}
      field={
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <RollField
            spec={D100}
            label={t('fumble-roll')}
            value={attack.roll?.fumbleRoll}
            onChange={(roll) => onUpdateFumbleRoll(roll.total)}
            disabled={action.status === 'completed'}
          />
          {hits && rolled && (
            <RollField
              spec={hits.spec}
              label={t('fumble-hits-dice', { dice: hits.dice })}
              value={fumble.damage}
              onChange={(roll) => onUpdateFumbleRoll(attack.roll!.fumbleRoll!, roll.total)}
              disabled={action.status === 'completed'}
            />
          )}
        </Stack>
      }
      chips={
        rolled && (
          <ChipRow>
            {!!fumble.damage && fumble.damage > 0 && (
              <RmuChip
                variant="outcome"
                tone="error"
                hint={t('dmg')}
                avatar={effectIcon('dmg')}
                label={t('damage-n', { damage: fumble.damage })}
              />
            )}
            {(fumble.effects ?? []).map((effect, effectIndex) => (
              <Tooltip key={effectIndex} title={t(effect.status)}>
                <RmuChip
                  variant="effect"
                  tone={effectColor(effect.status)}
                  avatar={effectIcon(effect.status)}
                  label={criticalEffectLabel(effect, t)}
                />
              </Tooltip>
            ))}
          </ChipRow>
        )
      }
    >
      {fumble.text && <Typography variant="body2">{tableText(fumble.text)}</Typography>}
      {fumble.additionalDamageText && (
        <Typography variant="body2" color="text.secondary">
          {t('fumble-additional-damage')}: {fumble.additionalDamageText}
        </Typography>
      )}
    </RollCard>
  );
};

export default ResolveAttackFormFumble;
