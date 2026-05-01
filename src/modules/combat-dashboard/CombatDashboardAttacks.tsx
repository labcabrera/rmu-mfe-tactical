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
  Autocomplete,
  TextField,
} from '@mui/material';
import { Character, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { fetchActions } from '../api/action';
import { Action, ActionAttack } from '../api/action.dto';

const CombatDashboardAttacks: FC = () => {
  const { showError } = useError();
  const { characters, game } = useContext(CombatContext)!;
  const [actions, setActions] = useState<Action[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [filterCharacterId, setFilterCharacterId] = useState<string | null>(null);

  const getActor = (actorId: string): Character => {
    return characters!.find((a) => a.id === actorId)!;
  };

  const filteredActions = () => {
    if (!filterCharacterId) return actions;
    return actions.filter((a) => a.actorId === filterCharacterId || filterTarget(filterCharacterId, a));
  };

  const filterTarget = (targetId: string, attack: Action): boolean => {
    return attack.attacks!.filter((e) => e.modifiers.targetId === targetId).length > 0;
  };

  useEffect(() => {
    const rsql = `(actionType==melee_attack,actionType==ranged_attack);gameId==${game?.id};status!=declared`;
    fetchActions(rsql, 0, 1000)
      .then((response) => setActions(response.content))
      .catch((err) => showError(err.message));
  }, [game]);

  if (!characters) return <p>Loading...</p>;

  return (
    <>
      <Stack spacing={1} sx={{mb:2}}>
        <SelectActor value={filterCharacterId} characters={characters} onChange={(e) => setFilterCharacterId(e)} />
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Attacker</TableCell>
              <TableCell>Defender</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>AP</TableCell>
              <TableCell align="right">Roll</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">BO</TableCell>
              <TableCell align="right">Parry</TableCell>
              <TableCell align="right">Damage</TableCell>
              <TableCell align="right">CRoll</TableCell>
              <TableCell>CText</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredActions().map((a: Action) =>
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
                  <TableRow
                    key={`${a.id || ''}-${idx}`}
                    hover
                    onClick={() => {
                      setSelectedAction(a);
                      setOpenDialog(true);
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
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
                    <TableCell align="right">
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
      {selectedAction && (
        <AttackShowDialog
          attack={selectedAction}
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setSelectedAction(null);
          }}
        />
      )}
    </>
  );
};

const SelectActor: FC<{
  value: string | null;
  characters: Character[];
  onChange: (characterId: string | null) => void;
}> = ({ value, characters, onChange }) => {
  const selected = characters.find((e) => e.id === (value ?? '')) ?? null;
  const handleChange = (_event: React.SyntheticEvent, newValue: Character | null) => {
    onChange(newValue?.id || null);
  };
  return (
    <Autocomplete
      options={characters}
      getOptionLabel={(opt) => opt?.name || ''}
      value={selected}
      onChange={handleChange}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderOption={(props, option) => (
        <li {...props}>
          <Stack direction="row" spacing={1} sx={{alignItems:"center"}}>
            <Avatar src={option.imageUrl} variant="square" sx={{ width: 40, height: 40 }} />
            <Typography variant="body2">{option.name}</Typography>
          </Stack>
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={t('Actor')} variant="outlined" />}
      sx={{ width: 220 }}
    />
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
