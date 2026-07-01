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
import { alpha, Box, Button, IconButton, Tooltip, Typography, Grid, Paper, Stack } from '@mui/material';
import { randomizeInitiatives, startPhase, startRound, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import CombatActorRoundListItem from './ActorRoundListItem';
import ActorRoundViewDialog from './ActorRoundViewDialog';

const PHASES = ['declare_initiative', 'phase_1', 'phase_2', 'phase_3', 'phase_4', 'upkeep'];
const ROUND_GRID_COLUMNS = '6fr 2fr 3fr repeat(4, 3fr) 9fr';

const CombatActorRoundList: FC = () => {
  const { game, actorRounds } = useContext(CombatContext)!;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActorRoundId, setSelectedActorRoundId] = useState<string | null>(null);
  const [displayPhase, setDisplayPhase] = useState<string>('initiative');

  useEffect(() => {
    if (!game) return;
    setDisplayPhase(game.phase);
  }, [game]);

  if (!game || !actorRounds || actorRounds.length === 0) return <p>Loading...</p>;

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12}>
          <Paper>
            <CombatActorRoundListHeader
              actorRounds={actorRounds}
              game={game}
              displayPhase={displayPhase}
              setDisplayPhase={setDisplayPhase}
            />
          </Paper>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={1}>
            {actorRounds.map((actorRound: ActorRound, index: number) => (
              <Grid key={index} size={12}>
                <CombatActorRoundListItem
                  actorRound={actorRound}
                  index={index}
                  displayPhase={displayPhase}
                  setDisplayPhase={setDisplayPhase}
                  onActorRoundView={(ar) => {
                    setSelectedActorRoundId(ar.id);
                    setDialogOpen(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
      <ActorRoundViewDialog
        open={dialogOpen}
        actorRound={actorRounds ? actorRounds.find((a) => a.id === selectedActorRoundId) || null : null}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

const CombatActorRoundListHeader: FC<{
  actorRounds: ActorRound[];
  game: TacticalGame;
  displayPhase: string;
  setDisplayPhase: Dispatch<SetStateAction<string>>;
}> = ({ actorRounds, game, displayPhase, setDisplayPhase }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();
  const { roundActorSort, refreshActorRounds, setRoundActorSort, setGame, setDisplayRound } =
    useContext(CombatContext)!;

  const notDisabled = (actorRound: ActorRound) => {
    if (!actorRound.effects) return true;
    if (actorRound.effects.some((e) => e.status === 'dead' || e.status === 'unconcious')) return false;
    return true;
  };

  const undeclaredInitiatives = actorRounds.filter((e) => notDisabled(e)).find((e) => !e.initiative.roll);

  const onRandomizeInitiatives = () => {
    randomizeInitiatives(game.id, auth)
      .then(() => refreshActorRounds())
      .catch((err) => showError(err.message));
  };

  const toggleSort = () => {
    setRoundActorSort((prevSort) => (prevSort === 'name' ? 'initiative' : 'name'));
  };

  const onNextRound = async () => {
    startRound(game!.id, auth)
      .then((game: TacticalGame) => {
        setGame(game);
        setDisplayRound(game.round);
        setDisplayPhase(game.phase);
      })
      .catch((err) => showError(err.message));
  };

  const onNextPhase = async () => {
    const displayPhaseIndex = PHASES.indexOf(displayPhase);
    const gamePhaseIndex = PHASES.indexOf(game.phase);

    if (displayPhaseIndex >= 0 && gamePhaseIndex >= 0 && displayPhaseIndex < gamePhaseIndex) {
      setDisplayPhase(PHASES[displayPhaseIndex + 1]);
      return;
    }

    startPhase(game!.id, auth)
      .then((game: TacticalGame) => setGame(game))
      .catch((err) => showError(err.message));
  };

  const onPrevPhase = async () => {
    const index = PHASES.indexOf(displayPhase);
    if (index > 0) setDisplayPhase(PHASES[index - 1]);
  };

  return (
    <Stack spacing={1.25} sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
            {t('Initiative order')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {roundActorSort === 'initiative' ? t('Ascending (Low -> High)') : t('Name order')}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title={roundActorSort === 'initiative' ? 'Sort by Name' : 'Sort by Initiative'}>
            <IconButton size="small" color="primary" onClick={() => toggleSort()} sx={{ border: '1px solid', borderColor: 'divider' }}>
              {roundActorSort === 'initiative' ? <SortIcon /> : <TextRotateVerticalIcon />}
            </IconButton>
          </Tooltip>
          {displayPhase === 'declare_initiative' && undeclaredInitiatives && (
            <Tooltip title="Randomize Initiatives">
              <IconButton size="small" color="primary" onClick={() => onRandomizeInitiatives()} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <ElectricBoltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {displayPhase === 'upkeep' ? (
            <Button variant="outlined" size="small" startIcon={<NextPlanIcon />} onClick={onNextRound}>
              {t('Next round')}
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={onNextPhase}
              disabled={displayPhase === 'declare_initiative' && !!undeclaredInitiatives}
              sx={{ color: 'success.light', borderColor: 'success.dark' }}
            >
              {t('End phase')}
            </Button>
          )}
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: ROUND_GRID_COLUMNS, columnGap: 1, alignItems: 'stretch' }}>
        <Box sx={{ minWidth: 0 }}>
          <HeaderCell title={t('Actors')} subtitle={t('Initiative order')} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <HeaderCell title={t('Initiative')} active={displayPhase === 'declare_initiative'} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <HeaderCell title={t('Actions')} />
        </Box>
        {[1, 2, 3, 4].map((phase) => (
          <Box key={phase} sx={{ minWidth: 0 }}>
            <PhaseHeaderCell
              phase={phase}
              active={displayPhase === `phase_${phase}`}
              onPrev={onPrevPhase}
              onNext={onNextPhase}
            />
          </Box>
        ))}
        <Box sx={{ minWidth: 0 }}>
          <HeaderCell title={displayPhase === 'upkeep' ? t('Upkeep') : t('Effects')} active={displayPhase === 'upkeep'} />
        </Box>
      </Box>
    </Stack>
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
        height: '100%',
        minHeight: 58,
        px: 1.25,
        py: 1,
        borderRadius: 1,
        bgcolor: active ? alpha(theme.palette.primary.main, 0.16) : alpha(theme.palette.background.default, 0.38),
        border: '1px solid',
        borderColor: active ? 'primary.main' : 'divider',
      })}
    >
      <Typography variant="body2" color={active ? 'primary.light' : 'text.primary'} sx={{ fontWeight: 700 }}>
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
  return (
    <Box
      sx={(theme) => ({
        height: '100%',
        minHeight: 58,
        px: 0.75,
        py: 0.75,
        borderRadius: 1,
        bgcolor: active ? alpha(theme.palette.primary.main, 0.18) : alpha(theme.palette.background.default, 0.38),
        border: '1px solid',
        borderColor: active ? 'primary.main' : 'divider',
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: 34 }}>
        {active ? <PrevButton onPrev={onPrev} /> : <Box sx={{ width: 24 }} />}
        <Stack sx={{ alignItems: 'center', minWidth: 0 }}>
          <Typography variant="body2" color={active ? 'primary.light' : 'text.primary'} sx={{ fontWeight: 700 }}>
            {`Phase ${phase}`}
          </Typography>
        </Stack>
        {active ? <NextButton onNext={onNext} /> : <Box sx={{ width: 24 }} />}
      </Stack>
    </Box>
  );
};

const NextButton: FC<{ onNext?: () => void }> = ({ onNext }) => {
  if (!onNext) return;
  return (
    <IconButton size="small" color="primary" onClick={() => onNext()}>
      <SkipNextIcon fontSize="small" />
    </IconButton>
  );
};

const PrevButton: FC<{ onPrev?: () => void }> = ({ onPrev }) => {
  if (!onPrev) return;
  return (
    <IconButton size="small" color="primary" onClick={() => onPrev()}>
      <SkipPreviousIcon fontSize="small" />
    </IconButton>
  );
};

export default CombatActorRoundList;
