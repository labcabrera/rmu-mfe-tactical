import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Stack, Typography } from '@mui/material';
import {
  ADRENAL_SKILLS,
  BlockBManeuverPurpose,
  FORTITUDE_SKILL_ID,
  MECHANICAL_FACTOR_OPTIONS,
  NumberPadField,
  WEIGHT_TRAINING_SKILL_ID,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ManeuverModifiersListing } from '../../../../api/action.dto';
import OptionTiles from '../../../action-dialogs/attack-modifiers/pickers/OptionTiles';
import { ADRENAL_PURPOSES, ManeuverForm } from './maneuver-form';

/** The block B purposes a skill can be rolled for (workspace spec 079). */
export const blockBPurposes = (skillId: string): BlockBManeuverPurpose[] => {
  if (skillId === WEIGHT_TRAINING_SKILL_ID) return ['feat-of-strength'];
  if (skillId === FORTITUDE_SKILL_ID) return ['fortitude'];
  if (ADRENAL_SKILLS[skillId]) return ['adrenal'];
  return [];
};

/**
 * Purposes of workspace spec 079, block B, in the modifiers step: a feat of strength (Weight Training: the load and its
 * mechanical advantage give the difficulty of Table 5-2, with the weight and St of the sheet), an adrenal move (§3.4: its
 * benefit starts next round) and Fortitude (§3.5: instantaneous, it halves the penalties at once). Adrenal moves and
 * Fortitude are absolute maneuvers on the adrenal table.
 */
const BlockBPurposeFields: FC<{
  listing: ManeuverModifiersListing;
  form: ManeuverForm;
  onChange: (change: Partial<ManeuverForm>) => void;
}> = ({ listing, form, onChange }) => {
  const { t } = useTranslation();
  const skillId = listing.skill.skillId;
  const purposes = blockBPurposes(skillId);
  if (purposes.length === 0) return null;
  const purpose = (purposes as string[]).includes(form.purpose ?? '') ? (form.purpose as BlockBManeuverPurpose) : null;
  const feat = listing.featOfStrength;
  const result = feat?.result;
  const choices = form.featOfStrength;
  const setFeat = (patch: Partial<ManeuverForm['featOfStrength']>) =>
    onChange({ featOfStrength: { ...choices, ...patch } });

  const choose = (key: string) => {
    const next = key === form.purpose ? null : (key as BlockBManeuverPurpose);
    onChange({ purpose: next, ...(next && ADRENAL_PURPOSES.includes(next) ? { maneuverType: 'absolute' } : {}) });
  };

  return (
    <Stack spacing={1.5}>
      <OptionTiles
        label={t('maneuver-purpose')}
        options={purposes.map((key) => ({ key, value: null }))}
        value={purpose ?? ''}
        onChange={choose}
        optionLabel={(option) => t(`maneuver-purpose-${option.key}`)}
      />
      {purpose && (
        <Alert severity="info" variant="outlined">
          {t(`maneuver-purpose-help-${purpose === 'adrenal' ? `adrenal-${ADRENAL_SKILLS[skillId]}` : purpose}`)}
        </Alert>
      )}
      {purpose === 'feat-of-strength' && (
        <Stack spacing={1.5}>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ width: 200 }}>
              <NumberPadField
                label={t('feat-of-strength-load')}
                value={choices.loadWeight ?? null}
                onChange={(loadWeight) => setFeat({ loadWeight: loadWeight ?? undefined })}
                steps={[-50, -10, 10, 50]}
                min={0}
              />
            </Box>
            {feat && feat.bodyWeight === null && (
              <>
                <Box sx={{ width: 200 }}>
                  <NumberPadField
                    label={t('feat-of-strength-body-weight')}
                    value={choices.bodyWeight ?? null}
                    onChange={(bodyWeight) => setFeat({ bodyWeight: bodyWeight ?? undefined })}
                    steps={[-10, 10]}
                    min={0}
                  />
                </Box>
                <Box sx={{ width: 200 }}>
                  <NumberPadField
                    label={t('feat-of-strength-strength-bonus')}
                    value={choices.strengthBonus ?? null}
                    onChange={(strengthBonus) => setFeat({ strengthBonus: strengthBonus ?? undefined })}
                    allowNegatives
                    integer
                  />
                </Box>
              </>
            )}
          </Stack>
          <OptionTiles
            label={t('feat-of-strength-mechanical-factor')}
            options={MECHANICAL_FACTOR_OPTIONS.map((factor) => ({ key: String(factor), value: null }))}
            value={String(choices.mechanicalFactor ?? 1)}
            onChange={(key) => setFeat({ mechanicalFactor: Number(key) })}
            optionLabel={(option) => t(`mechanical-factor-${option.key.replace('.', '_')}`)}
          />
          {result && (
            <Typography variant="body2" color="text.secondary">
              {t('feat-of-strength-explanation', {
                load: result.effectiveLoad,
                body: result.bodyWeight * result.weightMultiplier,
                percent: result.percent,
                st: result.strengthBonus,
                adjusted: result.adjustedPercent,
                difficulty: t(`difficulty-${result.difficulty}`),
              })}
              {result.weightMultiplier !== 1 &&
                ` ${t('feat-of-strength-adrenal', { multiplier: result.weightMultiplier })}`}
            </Typography>
          )}
          {result?.beyondTable && <Alert severity="warning">{t('feat-of-strength-beyond-table')}</Alert>}
          {feat?.invalid && <Alert severity="warning">{t(`feat-of-strength-invalid-${feat.invalid}`)}</Alert>}
        </Stack>
      )}
    </Stack>
  );
};

export default BlockBPurposeFields;
