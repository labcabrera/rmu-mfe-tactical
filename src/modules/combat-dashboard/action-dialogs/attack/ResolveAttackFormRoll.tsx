import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid, Chip, Stack, Typography } from '@mui/material';
import {
  CategorySeparator,
  OpenEndedRollInput,
  useNotify,
  ConfirmedRollInput,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { updateAttackRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { criticalCode } from '../../../services/action-service';
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
  const notify = useNotify();
  const [attackRoll, setAttackRoll] = useState<number | undefined>(attack.roll?.roll ?? undefined);
  const [locationRoll, setLocationRoll] = useState<number | undefined>(attack.roll?.locationRoll ?? undefined);
  const isCompleted = action.status === 'completed';

  if (!formData || !formData.attacks || formData.attacks.length <= index) return null;

  if (!attack.calculated) return <p>{t('attack-not-calculated')}</p>;

  const onRollChange = (value: number | undefined) => {
    setAttackRoll(value);
    handleRollChange(value, locationRoll);
  };

  const onLocationRollChange = (value: number | undefined) => {
    setLocationRoll(value);
    handleRollChange(attackRoll, value);
  };

  const handleRollChange = (newAttackRoll?: number | undefined, newLocationRoll?: number | undefined) => {
    const roll = newAttackRoll !== undefined ? newAttackRoll : attackRoll;
    const loc = newLocationRoll !== undefined ? newLocationRoll : locationRoll;
    if (roll === undefined || roll === null) return;
    if (attack.calculated!.requiredLocationRoll && (loc === undefined || loc === null)) return;
    // Nothing changed since the last stored roll.
    if (roll === attack.roll?.roll && (loc ?? null) === (attack.roll?.locationRoll ?? null)) return;
    updateAttackRoll(action.id, attack.attackName, roll, loc, auth)
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
      {attack.calculated.requiredLocationRoll && (
        <Grid size={6}>
          <ConfirmedRollInput
            label={t('location-roll')}
            value={attack.roll?.locationRoll}
            onConfirm={onLocationRollChange}
            disabled={isCompleted}
            error={!locationRoll}
          />
        </Grid>
      )}
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
