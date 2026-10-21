import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import { DataTable, TacticalGame, TacticalGameCharacterOutcome } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ApplyOutcomeButton } from './GameLifecycleButtons';
import { OutcomeApplyStatus, OutcomeConditions, OutcomeHp, OutcomeInjuries } from './outcome-view';

const formatDate = (value: string | undefined) => (value ? new Date(value).toLocaleString() : '');

/**
 * Outcome of a finished game (spec 013): per character, the hit points at the start and at the end, the injuries
 * taken, the conditions and fate, and whether it reached the strategic model (applied, error or pending), with the
 * button that applies (or retries) the ones still pending.
 */
const GameOutcomePanel: FC<{ game: TacticalGame; onApplied: (game: TacticalGame) => void }> = ({
  game,
  onApplied,
}) => {
  const { t } = useTranslation();
  const outcome = game.outcome;
  if (game.status !== 'finished' || !outcome) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h6">{t('tactical-game-outcome')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {t('tactical-game-finished-at', { date: formatDate(outcome.finishedAt) })}
            </Typography>
          </Box>
          <ApplyOutcomeButton game={game} onApplied={onApplied} />
        </Stack>
        {outcome.appliedAt ? (
          <Alert severity="success">
            {t('outcome-applied-at', { date: formatDate(outcome.appliedAt) })}
          </Alert>
        ) : (
          <Alert severity="info">{t('outcome-not-applied-help')}</Alert>
        )}
        {outcome.characters.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('finish-no-characters')}
          </Typography>
        ) : (
          <DataTable<TacticalGameCharacterOutcome>
            rows={outcome.characters}
            getKey={(character) => character.actorId}
            columns={[
              { key: 'name', header: t('name'), render: (character) => character.name },
              { key: 'hp', header: t('hp'), render: (character) => <OutcomeHp character={character} /> },
              {
                key: 'injuries',
                header: t('new-injuries'),
                render: (character) => <OutcomeInjuries character={character} />,
              },
              {
                key: 'conditions',
                header: t('conditions'),
                render: (character) => <OutcomeConditions character={character} />,
              },
              {
                key: 'status',
                header: t('status'),
                render: (character) => <OutcomeApplyStatus character={character} />,
              },
            ]}
          />
        )}
      </Stack>
    </Paper>
  );
};

export default GameOutcomePanel;
