import React, { FC } from 'react';
import {
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
} from '@mui/material';
import { ActorRound, ActorRoundAttack } from '../api/actor-rounds.dto';

const formatRanges = (ranges: ActorRoundAttack['ranges']): string => {
  if (!ranges || ranges.length === 0) return '-';
  return ranges.map((r) => `${r.from}-${r.to} (${r.bonus >= 0 ? `+${r.bonus}` : r.bonus})`).join(', ');
};

const ActorRoundAttacks: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const attacks = actorRound.attacks ?? [];

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Attacks</Typography>
      {attacks.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Attack</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Base BO</TableCell>
                <TableCell align="right">Current BO</TableCell>
                <TableCell align="right">Fumble</TableCell>
                <TableCell>Ranges</TableCell>
                <TableCell>Attack Table</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attacks.map((a: ActorRoundAttack, i: number) => (
                <TableRow key={`${a.attackName}-${i}`} hover>
                  <TableCell>{a.attackName}</TableCell>
                  <TableCell>{a.type}</TableCell>
                  <TableCell align="right">{a.baseBo}</TableCell>
                  <TableCell align="right">{a.currentBo}</TableCell>
                  <TableCell align="right">{a.fumble}</TableCell>
                  <TableCell>{formatRanges(a.ranges)}</TableCell>
                  <TableCell>{a.attackTable}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2">No attacks</Typography>
      )}
    </Stack>
  );
};

export default ActorRoundAttacks;
