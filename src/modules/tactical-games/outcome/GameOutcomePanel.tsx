import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Alert, Box, Collapse, IconButton, Paper, Stack, Typography } from '@mui/material';
import { DataTable, TacticalGame, TacticalGameCharacterOutcome } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ApplyOutcomeButton } from './GameLifecycleButtons';
import {
  OutcomeApplyStatus,
  OutcomeConditions,
  OutcomeItems,
  OutcomeHp,
  OutcomeInjuries,
  pendingOutcomeCharacters,
} from './outcome-view';

const formatDate = (value: string | undefined) => (value ? new Date(value).toLocaleString() : '');

/**
 * Outcome of a finished game (spec 013): per character, the hit points at the start and at the end, the injuries
 * taken, the conditions and fate, and whether it reached the strategic model (applied, error or pending), with the
 * button that applies (or retries) the ones still pending. `collapsible` (the combat board) folds it to a one-line
 * summary, folded at first once everything was applied so the board stays above the fold (spec 017).
 */
const GameOutcomePanel: FC<{ game: TacticalGame; onApplied: (game: TacticalGame) => void; collapsible?: boolean }> = ({
  game,
  onApplied,
  collapsible = false,
}) => {
  const { t } = useTranslation();
  const outcome = game.outcome;
  const pending = pendingOutcomeCharacters(outcome).length;
  const [open, setOpen] = useState(!collapsible || !outcome?.appliedAt || pending > 0);
  if (game.status !== 'finished' || !outcome) return null;
  const summary = t('outcome-summary', {
    count: outcome.characters.length,
    status: t(pending > 0 ? 'outcome-pending' : 'outcome-applied'),
  });

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {collapsible && (
              <IconButton
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-label={t(open ? 'collapse' : 'expand')}
              >
                {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            <Box>
              <Typography variant="h6">{t('tactical-game-outcome')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {open
                  ? t('tactical-game-finished-at', { date: formatDate(outcome.finishedAt) })
                  : `${formatDate(outcome.finishedAt)} · ${summary}`}
              </Typography>
            </Box>
          </Stack>
          <ApplyOutcomeButton game={game} onApplied={onApplied} />
        </Stack>
        <Collapse in={open} unmountOnExit>
          <Stack spacing={1.5}>
            {outcome.appliedAt ? (
              <Alert severity="success">{t('outcome-applied-at', { date: formatDate(outcome.appliedAt) })}</Alert>
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
                    key: 'items',
                    header: t('outcome-items'),
                    render: (character) => <OutcomeItems character={character} />,
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
        </Collapse>
      </Stack>
    </Paper>
  );
};

export default GameOutcomePanel;
