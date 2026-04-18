import React, { FC, useContext, useState } from 'react';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SortIcon from '@mui/icons-material/Sort';
import TextRotateVerticalIcon from '@mui/icons-material/TextRotateVertical';
import { IconButton, Tooltip, Typography, Grid, Paper, Stack } from '@mui/material';
import { randomizeInitiatives, startPhase, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import CombatActorRoundListItem from './ActorRoundListItem';
import ActorRoundViewDialog from './ActorRoundViewDialog';

const CombatActorRoundList: FC = () => {
  const { game, actorRounds } = useContext(CombatContext)!;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActorRoundId, setSelectedActorRoundId] = useState<string | null>(null);

  if (!game || !actorRounds || actorRounds.length === 0) return <p>Loading...</p>;

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12}>
          <Paper>
            <CombatActorRoundListHeader actorRounds={actorRounds} game={game} />
          </Paper>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={1}>
            {actorRounds.map((actorRound: ActorRound, index: number) => (
              <Grid key={index} size={12}>
                <CombatActorRoundListItem
                  actorRound={actorRound}
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

const CombatActorRoundListHeader: FC<{ actorRounds: ActorRound[]; game: TacticalGame }> = ({ actorRounds, game }) => {
  const { showError } = useError();
  const { roundActorSort, refreshActorRounds, setRoundActorSort, setGame } = useContext(CombatContext)!;

  const undeclaredInitiatives = actorRounds.find((e) => !e.initiative.roll);

  const onRandomizeInitiatives = () => {
    randomizeInitiatives(game.id)
      .then(() => refreshActorRounds())
      .catch((err) => showError(err.message));
  };

  const toggleSort = () => {
    setRoundActorSort((prevSort) => (prevSort === 'name' ? 'initiative' : 'name'));
  };

  const onNextPhase = async () => {
    startPhase(game!.id)
      .then((game: TacticalGame) => setGame(game))
      .catch((err) => showError(err.message));
  };

  return (
    <>
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
        <Grid size={2} sx={{ backgroundColor: game.phase === 'declare_initiative' ? 'secondary.main' : undefined }}>
          <Stack direction="row" justifyContent="space-between">
            <PhaseTypograpy label={t('Initiative')} active={game.phase === 'declare_initiative'} />
            {game.phase === 'declare_initiative' && undeclaredInitiatives && (
              <Tooltip title="Randomize Initiatives">
                <IconButton size="small" color="primary" onClick={() => onRandomizeInitiatives()}>
                  <ElectricBoltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {game.phase === 'declare_initiative' && !undeclaredInitiatives && <NextButton onNext={onNextPhase} />}
          </Stack>
        </Grid>
        <PhaseTitle label={'Phase 1'} active={game.phase === 'phase_1'} onNext={onNextPhase} />
        <PhaseTitle label={'Phase 2'} active={game.phase === 'phase_2'} onNext={onNextPhase} />
        <PhaseTitle label={'Phase 3'} active={game.phase === 'phase_3'} onNext={onNextPhase} />
        <PhaseTitle label={'Phase 4'} active={game.phase === 'phase_4'} onNext={onNextPhase} />
        <PhaseTitle label={'Effects'} active={false} gridSize={6} />
      </Grid>
    </>
  );
};

const PhaseTitle: FC<{ label: string; active: boolean; gridSize?: number; onNext?: () => void }> = ({
  label,
  gridSize = 2,
  active,
  onNext,
}) => {
  return (
    <Grid size={gridSize} sx={{ backgroundColor: active ? 'secondary.main' : undefined }}>
      <Stack direction="row" justifyContent="space-between">
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

export default CombatActorRoundList;
