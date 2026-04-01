import React, { FC, useContext, useState } from 'react';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import SortIcon from '@mui/icons-material/Sort';
import TextRotateVerticalIcon from '@mui/icons-material/TextRotateVertical';
import { IconButton, Tooltip, Typography, Grid, Paper } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { randomizeInitiatives } from '../../api/tactical-game';
import { TacticalGame } from '../../api/tactical-game.dto';
import ActorRoundViewDialog from './ActorRoundViewDialog';
import CombatActorRoundListItem from './CombatActorRoundListItem';

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
            <CombatActorRoundListHeader game={game} />
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

const CombatActorRoundListHeader: FC<{ game: TacticalGame }> = ({ game }) => {
  const { showError } = useError();
  const { roundActorSort, refreshActorRounds, setRoundActorSort } = useContext(CombatContext)!;

  const onRandomizeInitiatives = () => {
    randomizeInitiatives(game.id)
      .then(() => refreshActorRounds())
      .catch((err) => showError(err.message));
  };

  const toggleSort = () => {
    setRoundActorSort((prevSort) => (prevSort === 'name' ? 'initiative' : 'name'));
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={3}></Grid>
        <Grid size={1}>
          <Typography
            variant="subtitle1"
            align="left"
            color={game.phase === 'declare_initiative' ? 'primary' : 'secondary'}
          >
            {t('initiative')}
            {game.phase === 'declare_initiative' && (
              <Tooltip title="Randomize Initiatives">
                <IconButton size="small" color="primary" onClick={() => onRandomizeInitiatives()}>
                  <ElectricBoltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={roundActorSort === 'initiative' ? 'Sort by Name' : 'Sort by Initiative'}>
              <IconButton size="small" color="primary" onClick={() => toggleSort()}>
                {roundActorSort === 'initiative' ? <SortIcon /> : <TextRotateVerticalIcon />}
              </IconButton>
            </Tooltip>
          </Typography>
        </Grid>
        <Grid size={5}>
          <Grid container spacing={0}>
            <Grid size={3}>
              <Typography variant="subtitle1" align="left" color={game.phase === 'phase_1' ? 'primary' : 'secondary'}>
                Phase 1
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="subtitle1" align="left" color={game.phase === 'phase_2' ? 'primary' : 'secondary'}>
                Phase 2
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="subtitle1" align="left" color={game.phase === 'phase_3' ? 'primary' : 'secondary'}>
                Phase 3
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="subtitle1" align="left" color={game.phase === 'phase_4' ? 'primary' : 'secondary'}>
                Phase 4
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={1}>
          <Typography variant="subtitle1" align="left" color="secondary">
            Effects
          </Typography>
        </Grid>
        <Grid size={1}>
          <Typography variant="subtitle1" align="left" color="secondary">
            Alerts
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default CombatActorRoundList;
