import React, { FC, useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import CasinoIcon from '@mui/icons-material/Casino';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HistoryIcon from '@mui/icons-material/History';
import SortIcon from '@mui/icons-material/Sort';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ConfirmDialog,
  randomizeInitiatives,
  startPhase,
  startRound,
  TacticalGame,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import type { Action } from '../../api/action.dto';
import type { ActorRound } from '../../api/actor-rounds.dto';
import { useShortcut } from '../../services/shortcuts';
import { actionLabel } from './action-view';
import { PHASES } from './round-grid';

const isDown = (actorRound: ActorRound) =>
  actorRound.effects?.some((e) => e.status === 'dead' || e.status === 'unconcious');

/** Name of a phase in the stepper. */
const usePhaseLabel = () => {
  const { t } = useTranslation();
  return (phase: string) => {
    if (phase.startsWith('phase_')) return t('phase-n', { phase: phase.replace('phase_', '') });
    if (phase === 'declare_initiative') return t('initiative');
    return t(phase);
  };
};

/** What the primary button does in each phase. */
const useNextStepLabel = () => {
  const { t } = useTranslation();
  return (game: TacticalGame) => {
    if (game.phase === 'declare_initiative') return t('start-phase-n', { phase: 1 });
    if (game.phase === 'upkeep') return t('start-round-n', { round: game.round + 1 });
    const phase = parseInt(game.phase.replace('phase_', ''));
    return phase >= 4 ? t('start-upkeep') : t('start-phase-n', { phase: phase + 1 });
  };
};

/** Unresolved actions that the next step leaves behind, as "Actor: action" lines. */
const pendingActions = (game: TacticalGame, actions: Action[], actorRounds: ActorRound[], t: (k: string) => string) => {
  const phase = game.phase.startsWith('phase_') ? parseInt(game.phase.replace('phase_', '')) : 5;
  return actions
    .filter((action) => action.status !== 'completed' && action.phaseStart <= phase)
    .map((action) => {
      const actor = actorRounds.find((ar) => ar.actorId === action.actorId)?.actorName ?? '';
      return `${actor}: ${actionLabel(action, t as never, actorRounds)}`;
    });
};

/**
 * Header of the round board: the round (with a read-only history mode for earlier rounds), the phase
 * stepper, the order of the actors, and one primary button that says what it does ("Start phase 2"). It
 * asks for confirmation when something is left unresolved.
 */
const CombatRoundHeader: FC = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const phaseLabel = usePhaseLabel();
  const nextStepLabel = useNextStepLabel();
  const {
    game,
    setGame,
    actorRounds,
    roundActions,
    displayRound,
    setDisplayRound,
    roundActorSort,
    setRoundActorSort,
    refreshActorRounds,
  } = useContext(CombatContext)!;
  const [confirm, setConfirm] = useState<'next' | 'initiatives' | null>(null);
  const advanceRef = useRef<() => void>(() => undefined);

  // N does what the main button does: start the next phase or round, asking first when something is pending.
  useShortcut(['n', 'N'], () => {
    if (!game || !actorRounds || displayRound !== game.round) return false;
    const missingInitiative = actorRounds.some((ar) => !isDown(ar) && !ar.initiative?.roll);
    if (game.phase === 'declare_initiative' && missingInitiative) return false;
    if (pendingActions(game, roundActions ?? [], actorRounds, t).length > 0) setConfirm('next');
    else advanceRef.current();
  });

  if (!game || !actorRounds || displayRound === null) return null;

  const history = displayRound !== game.round;
  const active = actorRounds.filter((ar) => !isDown(ar));
  const undeclared = active.filter((ar) => !ar.initiative?.roll);
  const pending = pendingActions(game, roundActions ?? [], actorRounds, t);
  const blocked = game.phase === 'declare_initiative' && undeclared.length > 0;

  const advance = () => {
    setConfirm(null);
    const call = game.phase === 'upkeep' ? startRound(game.id, auth) : startPhase(game.id, auth);
    call
      .then((updated: TacticalGame) => {
        setGame(updated);
        setDisplayRound(updated.round);
        notify.success(
          updated.phase === 'declare_initiative' ? t('round-n', { round: updated.round }) : phaseLabel(updated.phase)
        );
      })
      .catch((err) => notify.error(err));
  };

  advanceRef.current = advance;

  const rollInitiatives = () => {
    setConfirm(null);
    randomizeInitiatives(game.id, auth)
      .then(() => {
        refreshActorRounds();
        notify.success(t('initiatives-rolled'));
      })
      .catch((err) => notify.error(err));
  };

  const sortLabel = roundActorSort === 'initiative' ? t('sort-by-name') : t('sort-by-initiative');

  return (
    <Paper sx={{ p: 1.5 }}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Tooltip title={t('display-previous-round')}>
              <span>
                <IconButton
                  aria-label={t('display-previous-round')}
                  disabled={displayRound <= 1}
                  onClick={() => setDisplayRound(displayRound - 1)}
                >
                  <ChevronLeftIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Typography variant="h6" component="h2" sx={{ px: 0.5 }}>
              {t('round-n', { round: displayRound })}
            </Typography>
            <Tooltip title={t('display-next-round')}>
              <span>
                <IconButton
                  aria-label={t('display-next-round')}
                  disabled={!history}
                  onClick={() => setDisplayRound(displayRound + 1)}
                >
                  <ChevronRightIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {!history && (
            <Box sx={{ flex: 1, minWidth: 0, overflowX: 'auto' }}>
              <Stepper activeStep={PHASES.indexOf(game.phase)} alternativeLabel sx={{ minWidth: 420 }}>
                {PHASES.map((phase) => (
                  <Step key={phase}>
                    <StepLabel>{phaseLabel(phase)}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
            <Tooltip title={sortLabel}>
              <IconButton
                aria-label={sortLabel}
                onClick={() => setRoundActorSort(roundActorSort === 'name' ? 'initiative' : 'name')}
              >
                {roundActorSort === 'initiative' ? <SortIcon /> : <SortByAlphaIcon />}
              </IconButton>
            </Tooltip>
            {!history && game.phase === 'declare_initiative' && (
              <Button
                variant="outlined"
                startIcon={<CasinoIcon />}
                onClick={() => (undeclared.length === active.length ? rollInitiatives() : setConfirm('initiatives'))}
              >
                {t('roll-all-initiatives')}
              </Button>
            )}
            {!history && (
              <Tooltip title={blocked ? t('pending-initiatives-n', { count: undeclared.length }) : ''}>
                <span>
                  <Button
                    variant="contained"
                    disabled={blocked}
                    onClick={() => (pending.length > 0 ? setConfirm('next') : advance())}
                  >
                    {nextStepLabel(game)}
                  </Button>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {history && (
          <Alert
            severity="info"
            icon={<HistoryIcon />}
            action={
              <Button color="inherit" size="small" onClick={() => setDisplayRound(game.round)}>
                {t('back-to-current-round')}
              </Button>
            }
          >
            {t('viewing-round-read-only', { round: displayRound })}
          </Alert>
        )}
      </Stack>

      <ConfirmDialog
        open={confirm === 'next'}
        title={nextStepLabel(game)}
        message={
          <Stack spacing={1}>
            <Typography>{t('unresolved-actions-n', { count: pending.length })}</Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {pending.map((line) => (
                <Typography component="li" variant="body2" key={line}>
                  {line}
                </Typography>
              ))}
            </Box>
          </Stack>
        }
        confirmLabel={nextStepLabel(game)}
        onClose={() => setConfirm(null)}
        onConfirm={advance}
      />
      <ConfirmDialog
        open={confirm === 'initiatives'}
        title={t('roll-all-initiatives')}
        message={t('roll-all-initiatives-confirmation')}
        confirmLabel={t('roll-all-initiatives')}
        onClose={() => setConfirm(null)}
        onConfirm={rollInitiatives}
      />
    </Paper>
  );
};

export default CombatRoundHeader;
