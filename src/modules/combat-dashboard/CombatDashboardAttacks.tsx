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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';
import { TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { fetchActions } from '../api/action';
import { Action, ActionAttack } from '../api/action.dto';
import { Character } from '../api/characters.dto';
import ActorAlertForm from './actor-alert-dialogs/ActorAlertForm';

const CombatDashboardAttacks: FC = () => {
  const { showError } = useError();
  const { characters, game } = useContext(CombatContext)!;
  const [actions, setActions] = useState<Action[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

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
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Attacker</TableCell>
              <TableCell>Defender</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>AP</TableCell>
              <TableCell>Roll</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>BO</TableCell>
              <TableCell>Parry</TableCell>
              <TableCell>Damage</TableCell>
              <TableCell>CRoll</TableCell>
              <TableCell>CText</TableCell>
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
                const criticalRolls = at.results?.criticals.map((c) => c.adjustedRoll) || [];
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
                        <Typography variant="body2">{defender?.name || '?'}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{a.actionType === 'melee_attack' ? 'Melee' : 'Ranged'}</TableCell>
                    <TableCell>{a.actionPoints}</TableCell>
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
                    <TableCell>{criticalRolls ? criticalRolls.join(', ') : ''}</TableCell>
                    <TableCell>{criticalTexts ? criticalTexts.join(', ') : ''}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const AttackShowDialog: FC<{ attack: Action; open: boolean; onClose: () => void }> = ({ attack, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>{t(`Attack info`)}</DialogTitle>
      <DialogContent dividers>
        <TechnicalInfo>
          <pre>{JSON.stringify(attack, null, 2)}</pre>
        </TechnicalInfo>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CombatDashboardAttacks;
