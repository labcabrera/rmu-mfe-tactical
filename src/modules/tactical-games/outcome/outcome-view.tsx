import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  effectColor,
  formatBonus,
  HpBreakdown,
  InjuryTypeChip,
  TacticalGameCharacterOutcome,
  TacticalGameOutcome,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** Where the hit points of the game went (spec 013, §1.1): by kind and by attacker, in a tooltip. */
export const OutcomeHpBreakdown: FC<{ character: TacticalGameCharacterOutcome }> = ({ character }) => {
  const { t } = useTranslation();
  const bySource = character.hpBySource;
  const hasTotals =
    !!bySource &&
    (Object.values(bySource.byKind ?? {}).some((amount) => !!amount) ||
      (bySource.byAttacker ?? []).some((attacker) => attacker.amount !== 0));
  if (!hasTotals) return null;
  return (
    <Tooltip title={<HpBreakdown bySource={bySource} dense />} enterTouchDelay={0} leaveTouchDelay={5000}>
      <IconButton size="small" aria-label={t('hp-by-source')} sx={{ ml: 0.25, p: 0.25 }}>
        <InfoOutlinedIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
};

/** Hit points at the start and at the end of the game, the difference and where they went. */
export const OutcomeHp: FC<{ character: TacticalGameCharacterOutcome }> = ({ character }) => (
  <Typography variant="body2" component="span" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
    {`${character.hp.start} → ${character.hp.end}`}
    {character.hp.delta !== 0 && (
      <Typography
        component="span"
        variant="caption"
        color={character.hp.delta < 0 ? 'error.main' : 'success.main'}
        sx={{ ml: 0.75 }}
      >
        {`(${formatBonus(character.hp.delta)})`}
      </Typography>
    )}
    <OutcomeHpBreakdown character={character} />
  </Typography>
);

/** The injuries taken in the game, one type chip each, and how many were healed. */
export const OutcomeInjuries: FC<{ character: TacticalGameCharacterOutcome }> = ({ character }) => {
  const { t } = useTranslation();
  const added = character.injuries.filter((injury) => character.injuriesAdded.includes(injury.id));
  if (added.length === 0 && character.injuriesHealed.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('no-new-injuries')}
      </Typography>
    );
  }
  return (
    <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
      {added.map((injury) => (
        <Tooltip
          key={injury.id}
          title={[
            t(`injury-severity-${injury.severity}`),
            injury.location ? t(injury.location) : undefined,
            `${t('penalty')} ${injury.penalty}`,
            injury.bleeding ? t('injury-bleeding-per-round', { value: injury.bleeding }) : undefined,
          ]
            .filter(Boolean)
            .join(' · ')}
        >
          <span>
            <InjuryTypeChip type={injury.type} />
          </span>
        </Tooltip>
      ))}
      {character.injuriesHealed.length > 0 && (
        <Typography variant="caption" color="success.main">
          {t('injuries-healed-n', { count: character.injuriesHealed.length })}
        </Typography>
      )}
    </Stack>
  );
};

/** Conditions at the end of the game (dead, unconscious, permanently unconscious) and the fate chosen. */
export const OutcomeConditions: FC<{ character: TacticalGameCharacterOutcome }> = ({ character }) => {
  const { t } = useTranslation();
  const statuses = Array.from(new Set(character.conditions.filter((c) => !c.resolvedAt).map((c) => c.status)));
  if (character.fate && !statuses.includes(character.fate)) statuses.push(character.fate);
  if (statuses.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }
  return (
    <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {statuses.map((status) => (
        <Chip
          key={status}
          size="small"
          color={effectColor(status)}
          label={t(`condition-${status}`)}
          variant={status === character.fate ? 'filled' : 'outlined'}
        />
      ))}
    </Stack>
  );
};

/** Whether the outcome of one character reached the strategic model: applied, failed (with the error) or pending. */
export const OutcomeApplyStatus: FC<{ character: TacticalGameCharacterOutcome }> = ({ character }) => {
  const { t } = useTranslation();
  if (character.appliedAt) {
    return <Chip size="small" color="success" variant="outlined" label={t('outcome-applied')} />;
  }
  if (character.error) {
    return (
      <Tooltip title={character.error}>
        <Chip size="small" color="error" label={t('outcome-apply-error')} />
      </Tooltip>
    );
  }
  return <Chip size="small" variant="outlined" label={t('outcome-pending')} />;
};

/** Characters whose outcome has not been applied yet (never tried, or failed). */
export const pendingOutcomeCharacters = (outcome: TacticalGameOutcome | undefined): TacticalGameCharacterOutcome[] =>
  (outcome?.characters ?? []).filter((character) => !character.appliedAt);
