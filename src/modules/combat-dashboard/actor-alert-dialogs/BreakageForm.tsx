import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  ItemConditionChip,
  NumericInput,
  OPEN_D100,
  RollBreakdown,
  RollField,
  TechnicalInfo,
  RollModifier,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound, ActorRoundAlert, ActorRoundItem, BreakageCheckDto } from '../../api/actor-rounds.dto';
import { isDevelopment } from '../../services/action-service';

export type BreakageFormValue = {
  itemId: string | null;
  roll: number | null;
  /** First die of the open-ended roll: an unmodified 66 is an unusual event. */
  unmodifiedRoll: number | null;
  /** Strength of an item without one. */
  strength: number | null;
  gmModifier: number | null;
};

const alertModifier = (alert: ActorRoundAlert | undefined, key: string) => alert?.modifiers?.find((m) => m.key === key);

/** Items the alert lets the game master choose (all of them for a manual check), the default one first. */
export const breakageCandidates = (actorRound: ActorRound, alert?: ActorRoundAlert): ActorRoundItem[] => {
  const items = actorRound.items || [];
  const ids = (alert?.modifiers || []).filter((m) => m.key === 'candidate').map((m) => m.modifier);
  return alert && ids.length > 0 ? items.filter((item) => ids.includes(item.itemId)) : items;
};

export const emptyBreakageForm = (
  actorRound: ActorRound,
  alert?: ActorRoundAlert,
  itemId?: string
): BreakageFormValue => ({
  itemId:
    itemId ?? alertModifier(alert, 'itemId')?.modifier ?? breakageCandidates(actorRound, alert)[0]?.itemId ?? null,
  roll: null,
  unmodifiedRoll: null,
  strength: null,
  gmModifier: null,
});

/**
 * Modifiers of a breakage check (§6.1): the item strength, its quality, its earlier damage, the penalty of the critical
 * or fumble and the game master's one. The API computes the same total; this is the preview.
 */
export const breakageModifiers = (
  item: ActorRoundItem | undefined,
  alert: ActorRoundAlert | undefined,
  value: BreakageFormValue
): RollModifier[] => {
  const quality = (item?.modifiers || [])
    .filter((m) => m.type !== 'breakage' && (m.appliesTo === 'all' || m.appliesTo === 'breakage'))
    .reduce((sum, m) => sum + (m.value || 0), 0);
  return [
    // Spec 052: the rule each entry comes from (§6.1, Table 6-1)
    { key: 'breakage-modifier-strength', value: item?.strength ?? value.strength ?? 0, rule: '§6.1' },
    { key: 'breakage-modifier-quality', value: quality, rule: 'Table 6-1' },
    { key: 'breakage-modifier-item-damage', value: item?.condition?.breakagePenalty ?? 0, rule: '§6.1' },
    { key: 'breakage-modifier-origin', value: alertModifier(alert, 'penalty')?.value ?? 0, rule: 'Table 6-1' },
    { key: 'breakage-modifier-gm', value: value.gmModifier ?? 0 },
  ].filter((m) => m.key === 'breakage-modifier-strength' || m.value !== 0);
};

/** The request of the check, or null while the form is incomplete. */
export const toBreakageDto = (
  actorRound: ActorRound,
  alert: ActorRoundAlert | undefined,
  value: BreakageFormValue
): BreakageCheckDto | null => {
  const item = (actorRound.items || []).find((each) => each.itemId === value.itemId);
  if (!item || value.roll === null) return null;
  if (item.strength === null && value.strength === null) return null;
  return {
    itemId: item.itemId,
    roll: value.roll,
    ...(value.unmodifiedRoll !== null ? { unmodifiedRoll: value.unmodifiedRoll } : {}),
    ...(alert ? { alertId: alert.id } : {}),
    ...(item.strength === null && value.strength !== null ? { strength: value.strength } : {}),
    ...(value.gmModifier ? { modifiers: [{ key: 'gm', value: value.gmModifier }] } : {}),
  };
};

/** Breakage check of an item of the actor, from a breakage alert or by hand (spec 019). */
export default function BreakageForm({
  actorRound,
  alert,
  value,
  onChange,
}: {
  actorRound: ActorRound;
  alert?: ActorRoundAlert;
  value: BreakageFormValue;
  onChange: (value: BreakageFormValue) => void;
}) {
  const { t } = useTranslation();
  const candidates = breakageCandidates(actorRound, alert);
  const item = candidates.find((each) => each.itemId === value.itemId);
  const origin = alertModifier(alert, 'origin')?.modifier;
  const location = alertModifier(alert, 'location')?.modifier;
  const modifiers = breakageModifiers(item, alert, value);

  if (candidates.length === 0) {
    return <Alert severity="info">{t('actor-items-empty')}</Alert>;
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={2}>
          {origin && (
            <Typography variant="body2" color="text.secondary">
              {t('breakage-origin')}: {t(`breakage-origin-${origin}`)}
              {location ? ` · ${t(location)}` : ''}
            </Typography>
          )}
          <TextField
            select
            label={t('breakage-item')}
            value={value.itemId ?? ''}
            onChange={(e) => onChange({ ...value, itemId: e.target.value, strength: null })}
          >
            {candidates.map((candidate) => (
              <MenuItem key={candidate.itemId} value={candidate.itemId}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <span>
                    {candidate.name} ({t(`item-kind-${candidate.kind}`)})
                  </span>
                  <ItemConditionChip condition={candidate.condition} />
                </Stack>
              </MenuItem>
            ))}
          </TextField>
          {item && item.strength === null && (
            <Box sx={{ maxWidth: 320 }}>
              <NumericInput
                label={t('breakage-strength')}
                value={value.strength}
                onChange={(strength) => onChange({ ...value, strength })}
                integer
              />
            </Box>
          )}
          <Box sx={{ maxWidth: 320 }}>
            <NumericInput
              label={t('breakage-gm-modifier')}
              value={value.gmModifier}
              onChange={(gmModifier) => onChange({ ...value, gmModifier })}
              integer
            />
          </Box>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={2}>
          <RollField
            spec={OPEN_D100}
            label={t('breakage-roll')}
            value={value.roll}
            onChange={(roll) => onChange({ ...value, roll: roll.total, unmodifiedRoll: roll.unmodified })}
          />
          <RollBreakdown
            context="breakage"
            modifiers={modifiers}
            roll={value.roll}
            totalLabel={value.roll === null ? t('predicted-total') : t('breakage-total')}
          />
          {value.unmodifiedRoll === 66 && <Alert severity="info">{t('breakage-unusual-66')}</Alert>}
        </Stack>
      </Grid>
      {isDevelopment && (
        <Grid size={12}>
          <TechnicalInfo>
            <pre>{JSON.stringify({ value, alert }, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      )}
    </Grid>
  );
}
