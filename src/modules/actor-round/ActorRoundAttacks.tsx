import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
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

const ActorRoundAttacks: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const attacks = actorRound.attacks ?? [];

  const getAttackTableLabel = (attack: ActorRoundAttack): string => {
    if (attack.attackSize === 0) return t(attack.attackTable);
    return `${t(attack.attackTable)} (${attack.attackSize > 0 ? '+' : ''}${attack.attackSize})`;
  };

  const formatRanges = (ranges: ActorRoundAttack['ranges']): string => {
    if (!ranges || ranges.length === 0) return '-';
    return ranges.map((r) => `${r.from}-${r.to} (${r.bonus >= 0 ? `+${r.bonus}` : r.bonus})`).join(', ');
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{t('attacks')}</Typography>
      {attacks.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('attack-name')}</TableCell>
                <TableCell>{t('type')}</TableCell>
                <TableCell>{t('attack-table')}</TableCell>
                <TableCell align="right">{t('base-ob')}</TableCell>
                <TableCell align="right">{t('current-ob')}</TableCell>
                <TableCell align="right">{t('fumble')}</TableCell>
                <TableCell>{t('ranges')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attacks.map((a: ActorRoundAttack, i: number) => (
                <TableRow key={`${a.attackName}-${i}`} hover>
                  <TableCell>{t(a.attackName)}</TableCell>
                  <TableCell>
                    {[
                      t(a.type),
                      a.twoHanded && t('two-handed-weapon'),
                      a.weaponCategory && a.weaponCategory !== 'standard' && t(`weapon-category-${a.weaponCategory}`),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </TableCell>
                  <TableCell>{getAttackTableLabel(a)}</TableCell>
                  <TableCell align="right">{a.baseBo}</TableCell>
                  <TableCell align="right">{a.currentBo}</TableCell>
                  <TableCell align="right">{a.fumble}</TableCell>
                  <TableCell>{formatRanges(a.ranges)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2">{t('no-attacks')}</Typography>
      )}
    </Stack>
  );
};

export default ActorRoundAttacks;
