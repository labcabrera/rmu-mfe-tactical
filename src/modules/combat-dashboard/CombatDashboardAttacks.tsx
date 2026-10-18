/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
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
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  Character,
  LoadingState,
  resolveAssetUrl,
  RmuDialog,
  TechnicalInfo,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { fetchActions } from '../api/action';
import { Action, ActionAttack } from '../api/action.dto';
import { isDevelopment } from '../services/action-service';

const CombatDashboardAttacks: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
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
    fetchActions(rsql, 0, 1000, auth)
      .then((response) => setActions(response.content))
      .catch((err) => notify.error(err));
  }, [game]);

  if (!characters) return <LoadingState />;

  return (
    <>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <SelectActor value={filterCharacterId} characters={characters} onChange={(e) => setFilterCharacterId(e)} />
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('attacker')}</TableCell>
              <TableCell>{t('defender')}</TableCell>
              <TableCell>{t('type')}</TableCell>
              <TableCell>AP</TableCell>
              <TableCell align="right">{t('roll')}</TableCell>
              <TableCell align="right">{t('total')}</TableCell>
              <TableCell align="right">{t('bo')}</TableCell>
              <TableCell align="right">{t('parry')}</TableCell>
              <TableCell align="right">{t('damage')}</TableCell>
              <TableCell align="right">{t('critical-roll')}</TableCell>
              <TableCell>{t('critical-text')}</TableCell>
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
                const parry =
                  a.actionType === 'melee_attack'
                    ? (a.parries ?? [])
                        .filter(
                          (p) => p.targetActorId === at.modifiers.targetId && p.targetAttackName === at.attackName
                        )
                        .map((p) => p.parry)
                        .join(', ') || '0'
                    : '-';
                const damage = at.results?.attackTableEntry?.text || '0';
                const criticals = at.results?.criticals ?? [];
                const criticalRolls = criticals.map((c) => c.adjustedRoll ?? '');
                const criticalTexts = criticals.map((c) => c.result?.text ?? '');
                return (
                  <TableRow
                    key={`${a.id || ''}-${idx}`}
                    hover
                    // The detail dialog only shows the raw attack, so it is a development aid.
                    onClick={
                      isDevelopment
                        ? () => {
                            setSelectedAction(a);
                            setOpenDialog(true);
                          }
                        : undefined
                    }
                    sx={{ cursor: isDevelopment ? 'pointer' : undefined }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Avatar src={resolveAssetUrl(attacker.imageUrl)} variant="square" />
                        <Typography variant="body2">{attacker.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Avatar src={resolveAssetUrl(defender?.imageUrl)} variant="square" />
                        <Typography variant="body2">{defender?.name || '?'}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{a.actionType === 'melee_attack' ? t('melee') : t('ranged')}</TableCell>
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
                    <TableCell>{criticalRolls.join(', ')}</TableCell>
                    <TableCell>{criticalTexts.join(', ')}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {isDevelopment && selectedAction && (
        <AttackShowDialog
          title={t('attack-info')}
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
  const { t } = useTranslation();
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
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Avatar src={resolveAssetUrl(option.imageUrl)} variant="square" sx={{ width: 40, height: 40 }} />
            <Typography variant="body2">{option.name}</Typography>
          </Stack>
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={t('actor')} variant="outlined" />}
      sx={{ width: 220 }}
    />
  );
};

const AttackShowDialog: FC<{ title: string; attack: Action; open: boolean; onClose: () => void }> = ({
  title,
  attack,
  open,
  onClose,
}) => {
  return (
    <RmuDialog title={title} open={open} onClose={onClose} maxWidth="xl">
      <TechnicalInfo>
        <pre>{JSON.stringify(attack, null, 2)}</pre>
      </TechnicalInfo>
    </RmuDialog>
  );
};

export default CombatDashboardAttacks;
