import React, { Dispatch, FC, SetStateAction } from 'react';
import {
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { StrategicGame, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { Action, ActionMovement } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';

const codes = [
  { id: 'creep', multiplier: 1 / 8, bonus: 0, label: 'x1/2' },
  { id: 'walk', multiplier: 1 / 4, bonus: -25, label: 'x1' },
  { id: 'jog', multiplier: 1 / 2, bonus: -50, label: 'x2' },
  { id: 'run', multiplier: 3 / 4, bonus: -75, label: 'x3' },
  { id: 'sprint', multiplier: 1, bonus: undefined, label: 'x4' },
  { id: 'dash', multiplier: 1.25, bonus: undefined, label: 'x5' },
];

const MovementPaceTableSelector: FC<{
  formData: ActionMovement;
  actorRound: ActorRound;
  game: TacticalGame;
  strategicGame: StrategicGame;
  action: Action;
  readonly?: boolean;
  setFormData: Dispatch<SetStateAction<ActionMovement>>;
}> = ({ formData, actorRound, game, strategicGame, action, readonly = false, setFormData }) => {
  const getActionPoints = () => {
    const startPhase = action.phaseStart;
    const currentPhase = parseInt((game.phase || '').replace('phase_', ''));
    return currentPhase - startPhase + 1;
  };

  const scaleMultiplier = strategicGame?.options?.boardScaleMultiplier || 1;
  const actionPoints = getActionPoints();

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <Typography variant="h6">Pace table</Typography>
      </Grid>
      <Grid size={12}>
        <TableContainer component={Paper}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Pace</TableCell>
                <TableCell align="right">Multiplier</TableCell>
                <TableCell align="right">BMR</TableCell>
                <TableCell align="right">Action points</TableCell>
                <TableCell align="right">Estimated distance</TableCell>
                <TableCell align="right">Distance (scaled)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {codes.map((pace) => {
                const estimated = actorRound.movement.bmr * pace.multiplier * actionPoints;
                const adjusted = estimated * scaleMultiplier;
                const isSelected = formData?.modifiers?.pace === pace.id;
                return (
                  <TableRow
                    key={pace.id}
                    hover
                    selected={isSelected}
                    onClick={
                      readonly
                        ? undefined
                        : () => setFormData({ ...formData, modifiers: { ...formData.modifiers, pace: pace.id } })
                    }
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{t(pace.id)}</TableCell>
                    <TableCell align="right">{pace.multiplier}</TableCell>
                    <TableCell align="right">{actorRound.movement.bmr}</TableCell>
                    <TableCell align="right">{actionPoints}</TableCell>
                    <TableCell align="right">{Number(estimated.toFixed(2))}'</TableCell>
                    <TableCell align="right">{Number(adjusted.toFixed(1))}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default MovementPaceTableSelector;
