import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { StrategicGame, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { Action, ActionMovement, MOVEMENT_TABLE } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';

const MovementPaceTableSelector: FC<{
  formData: ActionMovement;
  actorRound: ActorRound;
  game: TacticalGame;
  strategicGame: StrategicGame;
  action: Action;
  readonly?: boolean;
  setFormData: Dispatch<SetStateAction<ActionMovement>>;
}> = ({ formData, actorRound, game, strategicGame, action, readonly = false, setFormData }) => {
  const maxPace = actorRound.movement.maxPace;

  const getActionPoints = () => {
    const startPhase = action.phaseStart;
    const currentPhase = parseInt((game.phase || '').replace('phase_', ''));
    return currentPhase - startPhase + 1;
  };

  const isDisabled = (pace: string) => {
    const index = MOVEMENT_TABLE.findIndex((e) => e.id === pace);
    const maxIndex = MOVEMENT_TABLE.findIndex((e) => e.id === maxPace);
    return index > maxIndex;
  };

  const scaleMultiplier = strategicGame?.options?.boardScaleMultiplier || 1;
  const actionPoints = getActionPoints();

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Pace</TableCell>
                <TableCell align="right">Multiplier</TableCell>
                <TableCell align="right">BMR</TableCell>
                <TableCell align="right">Action points</TableCell>
                <TableCell align="right">Pace penalty</TableCell>
                <TableCell align="right">Estimated distance</TableCell>
                <TableCell align="right">Distance (scaled)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOVEMENT_TABLE.map((pace) => {
                const estimated = actorRound.movement.bmr * pace.multiplier * actionPoints;
                const adjusted = estimated * scaleMultiplier;
                const disabled = isDisabled(pace.id);
                const isSelected = formData?.modifiers?.pace === pace.id;
                if (readonly && action.movement?.modifiers.pace !== pace.id) {
                  return;
                }
                return (
                  <TableRow
                    key={pace.id}
                    hover
                    selected={isSelected}
                    onClick={
                      readonly || disabled
                        ? undefined
                        : () => setFormData({ ...formData, modifiers: { ...formData.modifiers, pace: pace.id } })
                    }
                    sx={{
                      cursor: disabled || readonly ? undefined : 'pointer',
                      opacity: disabled ? 0.5 : 1,
                      pointerEvents: disabled ? 'none' : 'auto',
                      backgroundColor: disabled ? 'action.disabledBackground' : 'inherit',
                      '&.Mui-selected': {
                        backgroundColor: (theme) => theme.palette.secondary.main,
                        color: (theme) => theme.palette.secondary.contrastText,
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: (theme) => theme.palette.secondary.dark,
                      },
                    }}
                  >
                    <TableCell>{t(pace.id)}</TableCell>
                    <TableCell align="right">{pace.multiplier}</TableCell>
                    <TableCell align="right">{actorRound.movement.bmr}</TableCell>
                    <TableCell align="right">{actionPoints}</TableCell>
                    <TableCell align="right">{pace.penalty || '-'}</TableCell>
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
