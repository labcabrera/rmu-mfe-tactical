import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid, Chip, Stack, Typography } from '@mui/material';
import { CategorySeparator, OpenEndedRollInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { updateAttackRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { criticalCode } from '../../../services/action-service';
import { useTacticalNotify } from '../../../services/notify-service';
import Effect from '../../../shared/generic/Effect';
import { AttackNextStep, AttackResultSummary } from './AttackResolutionGuide';
import ResolveAttackFormCriticals from './ResolveAttackFormCriticals';
import ResolveAttackFormFumble from './ResolveAttackFormFumble';
import ResolveAttackInfo from './ResolveAttackInfo';

const ResolveAttackFormRoll: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  action: Action;
  attack: ActionAttack;
  index: number;
}> = ({ formData, setFormData, action, attack, index }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { updateAction, actorRounds } = useContext(CombatContext)!;
  const notify = useTacticalNotify();
  const isCompleted = action.status === 'completed';

  if (!formData || !formData.attacks || formData.attacks.length <= index) return null;

  if (!attack.calculated) return <p>{t('attack-not-calculated')}</p>;

  // Without a called shot there is no location roll: the AT is the torso's (§9.5 Mixed armour).
  const onRollChange = (roll: number | undefined) => {
    if (roll === undefined || roll === null) return;
    // Nothing changed since the last stored roll.
    if (roll === attack.roll?.roll) return;
    updateAttackRoll(action.id, attack.attackName, roll, auth)
      .then((updatedAction) => {
        const newFormData = { attacks: updatedAction.attacks, parries: updatedAction.parries } as AttackDeclaration;
        updateAction(updatedAction);
        setFormData(newFormData);
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
        <ResolveAttackInfo attack={formData.attacks[index]} />
      </Grid>
      <Grid size={12}>
        <AttackNextStep attack={attack} />
      </Grid>
      <Grid size={12}>
        {attack.calculated.location && (
          <Grid size={8}>
            <Chip size="medium" color="error" label={t(attack.calculated.location)} />
          </Grid>
        )}
      </Grid>
      <Grid size={12}>
        <CategorySeparator text={t('attack-roll')} />
      </Grid>
      <Grid size={7}>
        <OpenEndedRollInput
          inputGridSize={12}
          gridColumns={12}
          label={t('attack-roll')}
          value={attack.roll?.roll ?? null}
          disabled={isCompleted}
          onChange={(e) => onRollChange(e ?? undefined)}
        />
      </Grid>
      <Grid size={5}>
        <Stack>
          <Typography variant="h6">{attack.calculated.rollTotal}</Typography>
          <Typography variant="body2" color="secondary">
            {t('total')}
          </Typography>
        </Stack>
      </Grid>
      <Grid size={12}>
        {attack.results && attack.results.attackTableEntry && (
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {attack.results.attackTableEntry.damage > 0 ? (
              <Effect
                status={'dmg'}
                label={t('damage-n', { damage: attack.results.attackTableEntry.damage })}
                color="error"
              />
            ) : (
              <Typography>{t('no-damage')}</Typography>
            )}
            {attack.results.attackTableEntry.criticalType && <Chip label={getCriticalText()} color="error" />}
            {attack.calculated.rollTotal > 175 && (
              <Chip label={getAbsoluteHitText(attack.calculated.rollTotal)} color="error" />
            )}
          </Stack>
        )}
      </Grid>

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
