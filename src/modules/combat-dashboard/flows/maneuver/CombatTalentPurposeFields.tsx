import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, MenuItem, Stack, TextField } from '@mui/material';
import {
  CombatTalentPurpose,
  formatBonus,
  NumberPadField,
  PRECISION_POSITIONS,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { COMBAT_TALENT_PURPOSE_AP } from '../../../services/ap-service';
import { FOE_PURPOSES } from '../../../services/combat-talents-service';
import OptionTiles from '../attack/modifiers/pickers/OptionTiles';
import { combatTalentModifiers, isCombatTalentPurpose, ManeuverForm, PRECISION_POSITION_VALUES } from './maneuver-form';

/**
 * The maneuver of a combat talent (workspace spec 076, §2.6), for the actors with the talent: Battle Cry (the level of
 * the highest level foe), Sense Weakness and Study Offense (the foe observed, a full round) and Precision (the foe,
 * where the attacker stands and the OB it gives up). The API checks the talent, the skill and the first round of
 * Battle Cry, and adds the effect on a success.
 */
const CombatTalentPurposeFields: FC<{
  purposes: CombatTalentPurpose[];
  form: ManeuverForm;
  onChange: (change: Partial<ManeuverForm>) => void;
  /** Foes the maneuver can be against: the other actors of the round. */
  targets: ActorRound[];
}> = ({ purposes, form, onChange, targets }) => {
  const { t } = useTranslation();
  if (purposes.length === 0) return null;
  const purpose = isCombatTalentPurpose(form.purpose) ? form.purpose : null;
  const ap = purpose ? COMBAT_TALENT_PURPOSE_AP[purpose] : undefined;
  const foeLevelModifier = combatTalentModifiers(form).find(
    (modifier) => modifier.key === 'battle-cry-foe-level'
  )?.value;
  const choose = (key: string) => {
    const next = key === form.purpose ? null : (key as CombatTalentPurpose);
    onChange({
      purpose: next,
      // Battle Cry and Precision are resolved as Medium: the API fixes it
      ...(next === 'battle-cry' || next === 'precision' ? { difficulty: 'm' } : {}),
    });
  };
  return (
    <Stack spacing={1.5}>
      <OptionTiles
        label={t('combat-talent-purpose')}
        options={purposes.map((key) => ({ key, value: null }))}
        value={purpose ?? ''}
        onChange={choose}
      />
      {purpose && (
        <Alert severity="info" variant="outlined">
          {t(`combat-talent-purpose-help-${purpose}`)}
          {ap && ` ${t('combat-talent-purpose-ap', { count: ap.min })}`}
        </Alert>
      )}
      {purpose && FOE_PURPOSES.includes(purpose) && (
        <TextField
          select
          size="small"
          label={t('combat-talent-foe')}
          value={form.foeActorId ?? ''}
          onChange={(event) => onChange({ foeActorId: event.target.value || null })}
          error={!form.foeActorId}
          sx={{ maxWidth: 280 }}
        >
          {targets.map((target) => (
            <MenuItem key={target.actorId} value={target.actorId}>
              {target.actorName}
            </MenuItem>
          ))}
        </TextField>
      )}
      {purpose === 'battle-cry' && (
        <Box sx={{ width: 200 }}>
          <NumberPadField
            label={t('battle-cry-foe-level')}
            value={form.foeLevel}
            onChange={(foeLevel) => onChange({ foeLevel })}
            helperText={foeLevelModifier ? formatBonus(foeLevelModifier) : undefined}
            min={0}
            integer
          />
        </Box>
      )}
      {purpose === 'precision' && (
        <>
          <OptionTiles
            label={t('precision-position')}
            options={PRECISION_POSITIONS.map((key) => ({ key, value: PRECISION_POSITION_VALUES[key] }))}
            value={form.position ?? ''}
            onChange={(key) => onChange({ position: key as ManeuverForm['position'] })}
            optionLabel={(option) => t(`precision-position-${option.key}`)}
          />
          <Box sx={{ width: 200 }}>
            <NumberPadField
              steps={[5, 10]}
              label={t('precision-ob-penalty')}
              helperText={t('precision-ob-penalty-help')}
              value={form.obPenalty}
              onChange={(obPenalty) => onChange({ obPenalty })}
              min={0}
              integer
            />
          </Box>
        </>
      )}
    </Stack>
  );
};

export default CombatTalentPurposeFields;
