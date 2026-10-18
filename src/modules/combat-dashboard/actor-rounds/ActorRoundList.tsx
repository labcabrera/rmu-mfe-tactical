import React, { Dispatch, FC, SetStateAction, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import NextPlanIcon from '@mui/icons-material/NextPlan';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SortIcon from '@mui/icons-material/Sort';
import TextRotateVerticalIcon from '@mui/icons-material/TextRotateVertical';
import { alpha, Box, Button, IconButton, Tooltip, Typography, Paper, Stack } from '@mui/material';
import {
  EmptyState,
  LoadingState,
  randomizeInitiatives,
  startPhase,
  startRound,
  TacticalGame,
  useNotify,
  usePhone,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import CombatActorRoundListItem from './ActorRoundListItem';
import ActorRoundViewDialog from './ActorRoundViewDialog';
import { PHASES, ROUND_GRID_COLUMNS, ROUND_GRID_MIN_WIDTH } from './round-grid';

type PhaseNavigation = {
  displayPhase: string;
  undeclaredInitiatives: boolean;
  onNextPhase: () => void;
  onPrevPhase: () => void;
  onNextRound: () => void;
};

/**
 * Round board. Tablets and desktops show a grid (one column per phase) that scrolls horizontally when it does
 * not fit; phones show a phase stepper and one stacked card per actor.
 */
const CombatActorRoundList: FC = () => {
  const { game, actorRounds } = useContext(CombatContext)!;
  const isPhone = usePhone();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActorRoundId, setSelectedActorRoundId] = useState<string | null>(null);
  const [displayPhase, setDisplayPhase] = useState<string>('initiative');

  useEffect(() => {
    if (!game) return;
    setDisplayPhase(game.phase);
  }, [game]);

  const navigation = usePhaseNavigation(game, actorRounds, displayPhase, setDisplayPhase);

  if (!game || !actorRounds) return <LoadingState />;
  if (actorRounds.length === 0) return <EmptyState />;

  const items = actorRounds.map((actorRound: ActorRound, index: number) => (
    <CombatActorRoundListItem
      key={actorRound.id ?? index}
      actorRound={actorRound}
      index={index}
      displayPhase={displayPhase}
      setDisplayPhase={setDisplayPhase}
      compact={isPhone}
      onActorRoundView={(ar) => {
        setSelectedActorRoundId(ar.id);
        setDialogOpen(true);
      }}
    />
  ));

  return (
    <>
      <Stack spacing={1}>
        <Paper>
          <CombatActorRoundListToolbar navigation={navigation} game={game} />
          {isPhone && <PhaseStepper navigation={navigation} />}
        </Paper>
        {isPhone ? (
          items
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Stack spacing={1} sx={{ minWidth: ROUND_GRID_MIN_WIDTH }}>
              <Paper sx={{ p: 1.5 }}>
                <RoundGridHeader navigation={navigation} />
              </Paper>
              {items}
            </Stack>
          </Box>
        )}
      </Stack>
      <ActorRoundViewDialog
        open={dialogOpen}
        actorRound={actorRounds ? actorRounds.find((a) => a.id === selectedActorRoundId) || null : null}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

const usePhaseNavigation = (
  game: TacticalGame | undefined | null,
  actorRounds: ActorRound[] | undefined | null,
  displayPhase: string,
  setDisplayPhase: Dispatch<SetStateAction<string>>
): PhaseNavigation => {
  const auth = useAuth();
  const notify = useNotify();
  const { setGame, setDisplayRound } = useContext(CombatContext)!;

  const notDisabled = (actorRound: ActorRound) =>
    !actorRound.effects?.some((e) => e.status === 'dead' || e.status === 'unconcious');
  const undeclaredInitiatives = !!actorRounds?.filter(notDisabled).find((e) => !e.initiative.roll);

  const onNextRound = () => {
    if (!game) return;
    startRound(game.id, auth)
      .then((game: TacticalGame) => {
        setGame(game);
        setDisplayRound(game.round);
        setDisplayPhase(game.phase);
      })
      .catch((err) => notify.error(err));
  };

  const onNextPhase = () => {
    if (!game) return;
    const displayPhaseIndex = PHASES.indexOf(displayPhase);
    const gamePhaseIndex = PHASES.indexOf(game.phase);

    if (displayPhaseIndex >= 0 && gamePhaseIndex >= 0 && displayPhaseIndex < gamePhaseIndex) {
      setDisplayPhase(PHASES[displayPhaseIndex + 1]);
      return;
    }

    startPhase(game.id, auth)
      .then((game: TacticalGame) => setGame(game))
      .catch((err) => notify.error(err));
  };

  const onPrevPhase = () => {
    const index = PHASES.indexOf(displayPhase);
    if (index > 0) setDisplayPhase(PHASES[index - 1]);
  };

  return { displayPhase, undeclaredInitiatives, onNextPhase, onPrevPhase, onNextRound };
};

const CombatActorRoundListToolbar: FC<{ navigation: PhaseNavigation; game: TacticalGame }> = ({ navigation, game }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const { roundActorSort, refreshActorRounds, setRoundActorSort } = useContext(CombatContext)!;
  const { displayPhase, undeclaredInitiatives, onNextPhase, onNextRound } = navigation;

  const onRandomizeInitiatives = () => {
    randomizeInitiatives(game.id, auth)
      .then(() => refreshActorRounds())
      .catch((err) => notify.error(err));
  };

  const toggleSort = () => {
    setRoundActorSort((prevSort) => (prevSort === 'name' ? 'initiative' : 'name'));
  };

  const sortLabel = roundActorSort === 'initiative' ? t('sort-by-name') : t('sort-by-initiative');

  return (
    <Stack direction="row" spacing={1.5} sx={{ p: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
      <Stack sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
          {t('initiative-order')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {roundActorSort === 'initiative' ? t('ascending-low-high') : t('name-order')}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
        <Tooltip title={sortLabel}>
          <IconButton
            size="small"
            color="primary"
            aria-label={sortLabel}
            onClick={() => toggleSort()}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            {roundActorSort === 'initiative' ? <SortIcon /> : <TextRotateVerticalIcon />}
          </IconButton>
        </Tooltip>
        {displayPhase === 'declare_initiative' && undeclaredInitiatives && (
          <Tooltip title={t('randomize-initiatives')}>
            <IconButton
              size="small"
              color="primary"
              aria-label={t('randomize-initiatives')}
              onClick={() => onRandomizeInitiatives()}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <ElectricBoltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {displayPhase === 'upkeep' ? (
          <Button variant="outlined" size="small" startIcon={<NextPlanIcon />} onClick={onNextRound}>
            {t('next-round')}
          </Button>
        ) : (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PlayArrowIcon />}
            onClick={onNextPhase}
            disabled={displayPhase === 'declare_initiative' && undeclaredInitiatives}
            sx={{ color: 'success.light', borderColor: 'success.dark' }}
          >
            {t('end-phase')}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

/** Name of a display phase: initiative, phase N or upkeep. */
const usePhaseLabel = () => {
  const { t } = useTranslation();
  return (phase: string) => {
    if (phase.startsWith('phase_')) return t('phase-n', { phase: phase.replace('phase_', '') });
    if (phase === 'declare_initiative') return t('initiative');
    return t(phase);
  };
};

/** Phones: the board shows one phase at a time, chosen with this stepper. */
const PhaseStepper: FC<{ navigation: PhaseNavigation }> = ({ navigation }) => {
  const phaseLabel = usePhaseLabel();
  const { displayPhase, onPrevPhase, onNextPhase } = navigation;
  const index = PHASES.indexOf(displayPhase);

  return (
    <Stack
      direction="row"
      sx={(theme) => ({
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: alpha(theme.palette.primary.main, 0.08),
      })}
    >
      <PrevButton onPrev={onPrevPhase} disabled={index <= 0} />
      <Typography variant="subtitle2" color="primary.light" sx={{ fontWeight: 700 }} aria-live="polite">
        {phaseLabel(displayPhase)}
      </Typography>
      <NextButton onNext={onNextPhase} />
    </Stack>
  );
};

const RoundGridHeader: FC<{ navigation: PhaseNavigation }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { displayPhase, onPrevPhase, onNextPhase } = navigation;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: ROUND_GRID_COLUMNS, columnGap: 1, alignItems: 'stretch' }}>
      <HeaderCell title={t('actors')} />
      <HeaderCell title={t('initiative')} active={displayPhase === 'declare_initiative'} />
      <HeaderCell title={t('actions')} />
      {[1, 2, 3, 4].map((phase) => (
        <PhaseHeaderCell
          key={phase}
          phase={phase}
          active={displayPhase === `phase_${phase}`}
          onPrev={onPrevPhase}
          onNext={onNextPhase}
        />
      ))}
      <HeaderCell title={displayPhase === 'upkeep' ? t('upkeep') : t('effects')} active={displayPhase === 'upkeep'} />
    </Box>
  );
};

const HeaderCell: FC<{
  title: string;
  subtitle?: string;
  active?: boolean;
}> = ({ title, subtitle, active = false }) => {
  return (
    <Box
      sx={(theme) => ({
        minWidth: 0,
        height: '100%',
        minHeight: 58,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 1.25,
        py: 1,
        borderRadius: 1,
        bgcolor: active ? alpha(theme.palette.primary.main, 0.16) : alpha(theme.palette.background.default, 0.38),
        border: '1px solid',
        borderColor: active ? 'primary.main' : 'divider',
      })}
    >
      <Typography variant="body2" color={active ? 'primary.light' : 'text.primary'} noWrap sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

const PhaseHeaderCell: FC<{
  phase: number;
  active: boolean;
  onPrev: () => void;
  onNext: () => void;
}> = ({ phase, active, onPrev, onNext }) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={(theme) => ({
        minWidth: 0,
        height: '100%',
        minHeight: 58,
        display: 'flex',
        alignItems: 'center',
        px: 0.5,
        py: 0.75,
        borderRadius: 1,
        bgcolor: active ? alpha(theme.palette.primary.main, 0.18) : alpha(theme.palette.background.default, 0.38),
        border: '1px solid',
        borderColor: active ? 'primary.main' : 'divider',
      })}
    >
      {/* The active phase stacks its label over the previous/next buttons, so neither is squeezed. */}
      <Stack sx={{ alignItems: 'center', width: '100%', minWidth: 0 }}>
        <Typography
          variant="body2"
          color={active ? 'primary.light' : 'text.primary'}
          noWrap
          sx={{ fontWeight: 700, maxWidth: '100%' }}
        >
          {t('phase-n', { phase })}
        </Typography>
        {active && (
          <Stack direction="row">
            <PrevButton onPrev={onPrev} />
            <NextButton onNext={onNext} />
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

const NextButton: FC<{ onNext: () => void }> = ({ onNext }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('next-phase')}>
      <IconButton size="small" color="primary" aria-label={t('next-phase')} onClick={() => onNext()}>
        <SkipNextIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

const PrevButton: FC<{ onPrev: () => void; disabled?: boolean }> = ({ onPrev, disabled = false }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('previous-phase')}>
      <span>
        <IconButton
          size="small"
          color="primary"
          aria-label={t('previous-phase')}
          disabled={disabled}
          onClick={() => onPrev()}
        >
          <SkipPreviousIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default CombatActorRoundList;
