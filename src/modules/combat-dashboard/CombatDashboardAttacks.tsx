/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Stack,
  Typography,
} from '@mui/material';
import { TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { fetchActions } from '../api/action';
import { Action, ActionAttack } from '../api/action.dto';
import { Character } from '../api/characters.dto';

const CombatDashboardAttacks: FC = () => {
  const { showError } = useError();
  const { characters, game } = useContext(CombatContext)!;
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    const rsql = `(actionType==melee_attack,actionType==ranged_attack);gameId==${game?.id};status!=declared`;
    fetchActions(rsql, 0, 1000)
      .then((response) => setActions(response.content))
      .catch((err) => showError(err.message));
  }, [game]);

  const getActor = (actorId: string): Character => {
    return characters!.find((a) => a.id === actorId)!;
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Attacker</TableCell>
            <TableCell>Defender</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Roll</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>BO</TableCell>
            <TableCell>Parry</TableCell>
            <TableCell>Damage</TableCell>
            <TableCell>Critical</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {actions.map((a: Action) =>
            (a.attacks ?? []).map((at: ActionAttack, idx: number) => {
              const attacker = getActor(a.actorId);
              const defender = getActor(at.modifiers.targetId);
              const roll = at.roll?.roll || 0;
              const rollTotal = at.calculated?.rollTotal || 0;
              const bo = at.modifiers.bo || 0;
              const parry = a.actionType === 'melee_attack' ? `${at.modifiers.parry}` || 0 : '-';
              const damage = at.results?.attackTableEntry?.text || '0';
              const criticalResults = at.results?.criticals.map((c) => c.result);
              const criticalTexts = criticalResults ? criticalResults.map((e) => e.text) : [];
              return (
                <TableRow key={`${a.id || ''}-${idx}`}>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Avatar src={attacker.imageUrl} variant="square" />
                      <Typography variant="body2">{attacker.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Avatar src={defender?.imageUrl || undefined} variant="square" />
                      <Typography variant="body2">{attacker?.name || '?'}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{a.actionType === 'melee_attack' ? 'Melee' : 'Ranged'}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color={roll < 1 ? 'error' : roll > 100 ? 'success' : undefined}>
                      {roll}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color={rollTotal > 100 ? 'success' : undefined}>
                      {rollTotal}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{bo}</TableCell>
                  <TableCell align="right">{parry}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color={damage !== '0' ? 'error' : undefined}>
                      {damage}
                    </Typography>
                  </TableCell>
                  <TableCell>{criticalTexts ? criticalTexts.join(', ') : ''}</TableCell>
                  <TableCell>
                    {/* <TechnicalInfo>
                      <pre>{JSON.stringify(a, null, 2)}</pre>
                    </TechnicalInfo> */}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CombatDashboardAttacks;
