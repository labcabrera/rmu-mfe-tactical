import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';
import { DataTable, formatBonus, SectionLabel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { GroupCheckKind, PsychologyTables, TableRange } from '../../api/psychology.dto';
import { usePsychologyTables } from '../../services/core-tables';

/** How many points of explanation each check has: `group-check-info-<kind>-<n>`. */
const POINTS: Record<GroupCheckKind, number> = { fear: 5, morale: 5, rally: 5 };

/** A band of a table: `1 - 25`, `176 +` or `< 1`, kept on one line. Bounds included, null is open. */
const rangeText = ({ min, max }: TableRange) => {
  if (min === null) return `<\u00a0${(max ?? 0) + 1}`;
  return max === null ? `${min}\u00a0+` : `${min}\u00a0-\u00a0${max}`;
};

const useSeverityChange = () => {
  const { t } = useTranslation();
  return (change: number) => {
    if (change < 0) return t('rally-calms', { count: -change });
    return change > 0 ? t('rally-worsens', { count: change }) : t('rally-no-change');
  };
};

const FearTable: FC<{ tables: PsychologyTables }> = ({ tables }) => {
  const { t } = useTranslation();
  return (
    <DataTable
      rows={tables.fearResults}
      getKey={(row) => row.result}
      columns={[
        { key: 'failure', header: t('group-check-info-failure-by'), render: (row) => rangeText(row) },
        { key: 'state', header: t('effect'), render: (row) => t(`fear-${row.result}`) },
        {
          key: 'rally',
          header: t('group-check-rally'),
          align: 'right',
          render: (row) => formatBonus(row.rallyModifier),
        },
        {
          key: 'what',
          header: t('group-check-info-what-happens'),
          render: (row) => t(`group-check-info-state-${row.result}`),
        },
      ]}
    />
  );
};

const MoraleTable: FC<{ tables: PsychologyTables }> = ({ tables }) => {
  const { t } = useTranslation();
  return (
    <>
      <DataTable
        rows={tables.morale}
        getKey={(row) => row.result}
        columns={[
          { key: 'total', header: t('total'), render: (row) => rangeText(row) },
          { key: 'outcome', header: t('result'), render: (row) => t(`morale-outcome-${row.outcome}`) },
          {
            key: 'modifier',
            header: t('group-check-info-later-morale'),
            render: (row) => {
              if (!row.moraleModifier) return '—';
              const value = formatBonus(row.moraleModifier);
              return row.moraleModifierDays === null
                ? t('group-check-info-modifier-until-lifted', { value })
                : t('group-check-info-modifier-days', { value, count: row.moraleModifierDays });
            },
          },
        ]}
      />
      <Typography variant="caption" color="text.secondary">
        {t('group-check-info-morale-unusual', { roll: tables.moraleUnusualEvent.roll })}
      </Typography>
    </>
  );
};

const RallyTable: FC<{ tables: PsychologyTables }> = ({ tables }) => {
  const { t } = useTranslation();
  const severityChange = useSeverityChange();
  const event = tables.rallyUnusualEvent;
  return (
    <>
      <DataTable
        rows={tables.rally}
        getKey={(row) => row.result}
        columns={[
          { key: 'total', header: t('total'), render: (row) => rangeText(row) },
          { key: 'change', header: t('result'), render: (row) => severityChange(row.fearSeverityChange) },
        ]}
      />
      <Typography variant="caption" color="text.secondary">
        {t('group-check-info-rally-group', {
          modifier: formatBonus(tables.rallyGroupModifier.modifier),
          count: tables.rallyGroupModifier.followersPerStep,
        })}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {t('group-check-info-rally-unusual', {
          roll: event.roll,
          bonus: formatBonus(event.leaderFearRrBonus),
          hits: event.leaderHits,
          count: event.durationDays,
        })}
      </Typography>
    </>
  );
};

/**
 * How a fear, morale or rally check works (Core Law §14.3), in our own words. The values of the tables are not in the
 * texts: they come from rmu-api-core, which asks for the rmu-core-law role, so without it only the explanation is shown.
 */
const GroupCheckInfo: FC<{ kind: GroupCheckKind }> = ({ kind }) => {
  const { t } = useTranslation();
  const tables = usePsychologyTables();
  return (
    <Stack
      spacing={1.5}
      sx={{ border: 1, borderColor: 'divider', borderRadius: (theme) => `${theme.radius.sm}px`, p: 2 }}
    >
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {Array.from({ length: POINTS[kind] }, (_, index) => (
          <Typography key={index} component="li" variant="body2" sx={{ mb: 0.75 }}>
            {t(`group-check-info-${kind}-${index + 1}`)}
          </Typography>
        ))}
      </Box>
      {tables ? (
        <Stack spacing={1}>
          <SectionLabel>{t(`group-check-info-${kind}-table`)}</SectionLabel>
          {kind === 'fear' && <FearTable tables={tables} />}
          {kind === 'morale' && <MoraleTable tables={tables} />}
          {kind === 'rally' && <RallyTable tables={tables} />}
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">
          {t('group-check-info-no-tables')}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        {t('group-check-info-source')}
      </Typography>
    </Stack>
  );
};

export default GroupCheckInfo;
