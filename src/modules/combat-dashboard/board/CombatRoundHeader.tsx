import { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import CasinoIcon from '@mui/icons-material/Casino';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FlagIcon from '@mui/icons-material/Flag';
import HistoryIcon from '@mui/icons-material/History';
import PsychologyIcon from '@mui/icons-material/Psychology';
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
  // The round phase indicator is horizontal, not a guided flow: FlowSteps has no such variant (spec 066).
  // eslint-disable-next-line no-restricted-imports
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
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TFunction } from 'i18next';
import GroupCheckDialog from '../../actor-round/psychology/group-check/GroupCheckDialog';
import type { Action } from '../../api/action.dto';
import type { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound, useCombatActions } from '../../combat/combat-context';
import { useOpenRounds } from '../../hooks/useOpenRounds';
import { useShortcut } from '../../hooks/useShortcut';
import { isActorRoundDown, isActorRoundFlatfooted } from '../../services/actor-round-service';
import { ActionDestiny, actionDestiny, freeMovementCandidates, isActionClosed } from '../../services/ap-service';
import { isGameFinished } from '../../services/game-service';
import { phaseNumber, PHASES } from '../../services/phase-service';
import { canManageTactical } from '../../shared/permissions';
import { actionLabel } from './action-view';

/** Flatfooted actors do not roll initiative (§8.3 Surprise), like the ones that are down. */
const rollsInitiative = (actorRound: ActorRound) =>
  !isActorRoundDown(actorRound) && !isActorRoundFlatfooted(actorRound);

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

type PendingAction = { key: string; line: string; destiny: ActionDestiny };

/**
 * Open and held actions that the next step leaves behind, as "Actor: action" lines with what will happen to them
 * (spec 011, §5): they go on with 1 AP more, are interrupted when the actor cannot act, stay open into the upkeep,
 * and at the end of the round go on in the next one (open rounds) or expire. The API does it on its own.
 */
const pendingActions = (
  game: TacticalGame,
  actions: Action[],
  actorRounds: ActorRound[],
  t: TFunction,
  openRounds: boolean
): PendingAction[] => {
  const phase = game.phase === 'declare_initiative' ? 0 : phaseNumber(game.phase);
  return actions
    .filter((action) => !isActionClosed(action) && action.phaseStart <= Math.max(phase, 1))
    .map((action) => {
      const actorRound = actorRounds.find((ar) => ar.actorId === action.actorId);
      return {
        key: action.id,
        line: `${actorRound?.actorName ?? ''}: ${actionLabel(action, t, actorRounds)}`,
        destiny: actionDestiny(action, actorRound, phase, openRounds),
      };
    });
};

/**
 * Actors able to act that have no action in the phase being left (workspace spec 089): a reminder for whoever manages
 * the game before moving on, which never blocks it.
 */
const actorsWithoutAction = (game: TacticalGame, actions: Action[], actorRounds: ActorRound[]): ActorRound[] =>
  game.phase.startsWith('phase_') && canManageTactical(game)
    ? freeMovementCandidates(actorRounds, actions, phaseNumber(game.phase))
    : [];

/**
 * Header of the round board: the round (with a read-only history mode for earlier rounds), the phase
 * stepper, the order of the actors, and one primary button that says what it does ("Start phase 2"). It
 * asks for confirmation when something is left unresolved.
 */
const CombatRoundHeader: FC = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const phaseLabel = usePhaseLabel();
  const nextStepLabel = useNextStepLabel();
  const { game } = useCombatGame();
  const { actorRounds, roundActions, displayRound, roundActorSort } = useCombatRound();
  const { setGame, setDisplayRound, setRoundActorSort, refreshActorRounds } = useCombatActions();
  const openRounds = useOpenRounds();
  const [confirm, setConfirm] = useState<'next' | 'initiatives' | null>(null);
  const [groupChecks, setGroupChecks] = useState(false);
  const advanceRef = useRef<() => void>(() => undefined);

  // N does what the main button does: start the next phase or round, asking first when something is pending.
  useShortcut(['n', 'N'], () => {
    if (!game || !actorRounds || displayRound !== game.round || isGameFinished(game)) return false;
    const missingInitiative = actorRounds.some((ar) => rollsInitiative(ar) && !ar.initiative?.roll);
    if (game.phase === 'declare_initiative' && missingInitiative) return false;
    const actions = roundActions ?? [];
    if (
      pendingActions(game, actions, actorRounds, t, openRounds).length > 0 ||
      actorsWithoutAction(game, actions, actorRounds).length > 0
    )
      setConfirm('next');
    else advanceRef.current();
  });

  if (!game || !actorRounds || displayRound === null) return null;

  const history = displayRound !== game.round;
  // A finished game is read-only (spec 013): no phase to advance, no initiative to roll.
  const finished = isGameFinished(game);
  const playing = !history && !finished;
  const active = actorRounds.filter(rollsInitiative);
  const undeclared = active.filter((ar) => !ar.initiative?.roll);
  const pending = pendingActions(game, roundActions ?? [], actorRounds, t, openRounds);
  const withoutAction = actorsWithoutAction(game, roundActions ?? [], actorRounds);
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
        {/* Without the stepper (history, finished game) the round and the buttons share one line on every screen. */}
        <Stack
          direction={playing ? { xs: 'column', md: 'row' } : 'row'}
          spacing={1.5}
          sx={{ alignItems: playing ? { md: 'center' } : 'center', justifyContent: 'space-between' }}
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

          {playing && (
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
            {playing && (
              // Spec 022: fear, morale and rally checks of a group, for the game master.
              <Tooltip title={t('group-checks')}>
                <IconButton aria-label={t('group-checks')} onClick={() => setGroupChecks(true)}>
                  <PsychologyIcon />
                </IconButton>
              </Tooltip>
            )}
            {playing && game.phase === 'declare_initiative' && (
              <Button
                variant="outlined"
                startIcon={<CasinoIcon />}
                onClick={() => (undeclared.length === active.length ? rollInitiatives() : setConfirm('initiatives'))}
              >
                {t('roll-all-initiatives')}
              </Button>
            )}
            {playing && (
              <Tooltip title={blocked ? t('pending-initiatives-n', { count: undeclared.length }) : ''}>
                <span>
                  <Button
                    variant="contained"
                    disabled={blocked}
                    onClick={() => (pending.length > 0 || withoutAction.length > 0 ? setConfirm('next') : advance())}
                  >
                    {nextStepLabel(game)}
                  </Button>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {finished && (
          <Alert severity="info" icon={<FlagIcon />}>
            {t('tactical-game-finished-read-only')}
          </Alert>
        )}
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
            {withoutAction.length > 0 && (
              <>
                <Typography>{t('undeclared-actors-n', { count: withoutAction.length })}</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {withoutAction.map((actorRound) => (
                    <Typography component="li" variant="body2" key={actorRound.actorId}>
                      {actorRound.actorName}
                    </Typography>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {t('undeclared-actors-help')}
                </Typography>
              </>
            )}
            {pending.length > 0 && (
              <>
                <Typography>{t('open-actions-n', { count: pending.length })}</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {pending.map((item) => (
                    <Typography component="li" variant="body2" key={item.key}>
                      {item.line}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                        color={
                          item.destiny === 'interrupted' || item.destiny === 'expires'
                            ? 'warning.main'
                            : 'text.secondary'
                        }
                      >
                        {` → ${t(`action-destiny-${item.destiny}`)}`}
                      </Typography>
                    </Typography>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {t('action-destiny-help')}
                </Typography>
              </>
            )}
          </Stack>
        }
        confirmLabel={nextStepLabel(game)}
        onClose={() => setConfirm(null)}
        onConfirm={advance}
      />
      <GroupCheckDialog open={groupChecks} onClose={() => setGroupChecks(false)} />
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
