import React, { Dispatch, FC, SetStateAction, useContext, useEffect, useState } from 'react';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import NextPlanIcon from '@mui/icons-material/NextPlan';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SortIcon from '@mui/icons-material/Sort';
import TextRotateVerticalIcon from '@mui/icons-material/TextRotateVertical';
import { IconButton, Tooltip, Typography, Grid, Paper, Stack } from '@mui/material';
import { randomizeInitiatives, startPhase, startRound, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import CombatActorRoundListItem from './ActorRoundListItem';
import ActorRoundViewDialog from './ActorRoundViewDialog';

const PHASES = ['declare_initiative', 'phase_1', 'phase_2', 'phase_3', 'phase_4', 'upkeep'];

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
  const { showError } = useError();
  const { roundActorSort, refreshActorRounds, setRoundActorSort, setGame, setDisplayRound } =
    useContext(CombatContext)!;

  const undeclaredInitiatives = actorRounds.find((e) => !e.initiative.roll);

  const onRandomizeInitiatives = () => {
    randomizeInitiatives(game.id)
      .then(() => refreshActorRounds())
      .catch((err) => showError(err.message));
  };

  const toggleSort = () => {
    setRoundActorSort((prevSort) => (prevSort === 'name' ? 'initiative' : 'name'));
  };

  const onNextRound = async () => {
    startRound(game!.id)
      .then((game: TacticalGame) => {
        setGame(game);
        setDisplayRound(game.round);
        setDisplayPhase(game.phase);
      })
      .catch((err) => showError(err.message));
  };

  const onNextPhase = async () => {
    startPhase(game!.id)
      .then((game: TacticalGame) => setGame(game))
      .catch((err) => showError(err.message));
  };

  const onPrevPhase = async () => {
    const index = PHASES.indexOf(displayPhase);
    if (index > 0) setDisplayPhase(PHASES[index - 1]);
  };

  return (
    <Grid container columns={24} spacing={1}>
      <Grid size={5}>
        <Stack direction="row" justifyContent="space-between">
          <PhaseTypograpy label={t('Actors')} active={false} />
          <Tooltip title={roundActorSort === 'initiative' ? 'Sort by Name' : 'Sort by Initiative'}>
            <IconButton size="small" color="primary" onClick={() => toggleSort()}>
              {roundActorSort === 'initiative' ? <SortIcon /> : <TextRotateVerticalIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Grid>
      <Grid size={2} sx={{ backgroundColor: displayPhase === 'declare_initiative' ? 'secondary.main' : undefined }}>
        <Stack direction="row" justifyContent="space-between">
          <PhaseTypograpy label={t('Initiative')} active={displayPhase === 'declare_initiative'} />
          {displayPhase === 'declare_initiative' && undeclaredInitiatives && (
            <Tooltip title="Randomize Initiatives">
              <IconButton size="small" color="primary" onClick={() => onRandomizeInitiatives()}>
                <ElectricBoltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {displayPhase === 'declare_initiative' && !undeclaredInitiatives && <NextButton onNext={onNextPhase} />}
        </Stack>
      </Grid>
      <PhaseTitle label={'Phase 1'} active={displayPhase === 'phase_1'} onPrev={onPrevPhase} onNext={onNextPhase} />
      <PhaseTitle label={'Phase 2'} active={displayPhase === 'phase_2'} onPrev={onPrevPhase} onNext={onNextPhase} />
      <PhaseTitle label={'Phase 3'} active={displayPhase === 'phase_3'} onPrev={onPrevPhase} onNext={onNextPhase} />
      <PhaseTitle label={'Phase 4'} active={displayPhase === 'phase_4'} onPrev={onPrevPhase} onNext={onNextPhase} />
      <Grid size={6}>
        <Stack direction="row" justifyContent="space-between">
          <PhaseTypograpy label={displayPhase === 'upkeep' ? 'Upkeep' : 'Effects'} active={displayPhase === 'upkeep'} />
          {displayPhase === 'upkeep' && (
            <Stack direction="row" spacing={1}>
              <IconButton size="small" color="primary" onClick={onPrevPhase}>
                <SkipPreviousIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="primary" onClick={onNextRound}>
                <NextPlanIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};

const PhaseTitle: FC<{
  label: string;
  active: boolean;
  gridSize?: number;
  onPrev?: () => void;
  onNext?: () => void;
}> = ({ label, gridSize = 2, active, onPrev, onNext }) => {
  return (
    <Grid size={gridSize} sx={{ backgroundColor: active ? 'secondary.main' : undefined }}>
      <Stack direction="row" justifyContent="space-between">
        {active && onPrev && <PrevButton onPrev={onPrev} />}
        <PhaseTypograpy label={label} active={active} />
        {active && onNext && <NextButton onNext={onNext} />}
      </Stack>
    </Grid>
  );
};

const PhaseTypograpy: FC<{ label: string; active: boolean }> = ({ label, active }) => {
  return (
    <Typography variant="body1" align="left" color={active ? 'white' : 'secondary'} sx={{ fontWeight: 600, m: 1 }}>
      {label}
    </Typography>
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
