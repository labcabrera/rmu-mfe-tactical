import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ChipRow, formatBonus, SectionLabel, StatPill } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { ActorRound } from '../api/actor-rounds.dto';
import {
  effectiveBmr,
  effectiveMaxPace,
  paceIndex,
  PACES,
  roundMovement,
} from '../services/movement-service';
import { useSkillService } from '../services/skill-service';

const feet = (value: number) => `${Math.round(value * 10) / 10}'`;

/**
 * Movement tab of the actor sheet (workspace spec 081), read only: what the actor can move and what it has moved in the
 * round, and the speeds of Table 5-3 with its BMR.
 */
const ActorRoundMovement: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const { actorRounds, roundActions, strategicGame } = useContext(CombatContext)!;
  const { getSkillBonus } = useSkillService();
  const scale = strategicGame?.options?.boardScaleMultiplier || 1;
  const { bmr, reasons } = effectiveBmr(actorRound);
  const max = effectiveMaxPace(actorRound, actorRounds);
  const round = roundMovement(roundActions ?? [], actorRound.actorId, actorRound.round);
  const roundPace = round.normalPace;
  const limit = bmr * PACES[paceIndex(max.pace)].perRound;
  const footwork = getSkillBonus('footwork', actorRound);
  const accumulator = actorRound.fatigue?.accumulator ?? 0;
  const inBoard = (value: number) =>
    scale !== 1 ? `${feet(value)} (${Math.round(value * scale * 10) / 10})` : feet(value);

  return (
    <Stack spacing={2}>
      <SectionLabel>{t('movement-actor')}</SectionLabel>
      <ChipRow>
        <StatPill label={t('bmr')} hint={t('bmr-effective')} value={feet(bmr)} />
        {bmr !== actorRound.movement.bmr && (
          <StatPill label={t('bmr-base')} hint={t('bmr-base')} value={feet(actorRound.movement.bmr)} />
        )}
        <StatPill label={t('max-pace')} hint={t('max-pace')} value={t(max.pace)} />
        <StatPill
          label={t('maneuver-penalty')}
          hint={t('maneuver-penalty')}
          value={formatBonus(actorRound.movement.penalty)}
        />
        {footwork !== undefined && (
          <StatPill label={t('footwork')} hint={t('footwork')} value={formatBonus(footwork)} />
        )}
      </ChipRow>
      {(reasons.length > 0 || max.reasons.length > 0) && (
        <ChipRow>
          {reasons.map((reason) => (
            <Chip
              key={reason}
              size="small"
              variant="outlined"
              color="info"
              label={`${t(`bmr-multiplier-${reason}`)}: ${t('bmr')} ×½`}
            />
          ))}
          {max.reasons.map((reason) => (
            <Chip key={reason} size="small" variant="outlined" color="warning" label={t(reason)} />
          ))}
        </ChipRow>
      )}

      <SectionLabel>{t('movement-this-round')}</SectionLabel>
      <ChipRow>
        <StatPill label={t('movement-ap')} hint={t('movement-ap')} value={round.normalAp} />
        <StatPill
          label={t('movement-round-pace')}
          hint={t('movement-round-pace')}
          value={roundPace ? t(roundPace) : '—'}
        />
        <StatPill label={t('distance')} hint={t('movement-distance-moved')} value={feet(round.moved)} />
        <StatPill
          label={t('movement-left')}
          hint={t('movement-left-help')}
          value={feet(Math.max(0, limit - round.moved))}
        />
        <StatPill label={t('fatigue')} hint={t('movement-next-check')} value={`${Math.round(accumulator)}/100`} />
      </ChipRow>
      {round.freeMovements.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {t('free-movements')}
          </Typography>
          {round.freeMovements.map((action) => {
            const pace = action.movement?.modifiers?.pace;
            const row = PACES[paceIndex(pace)];
            const resolved = action.status === 'completed';
            return (
              <Typography key={action.id} variant="body2">
                {[
                  t('phase-n', { phase: action.phaseStart }),
                  resolved && pace ? `${t(pace)} (${formatBonus(row?.penalty ?? 0)})` : t('movement-unresolved'),
                  resolved ? feet(action.movement?.calculated?.distance ?? 0) : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            );
          })}
        </Stack>
      )}

      <SectionLabel>{t('movement-speeds')}</SectionLabel>
      <TableContainer>
        <Table aria-label={t('movement-speeds')}>
          <TableHead>
            <TableRow>
              <TableCell>{t('pace')}</TableCell>
              <TableCell align="right">{t('movement-per-round')}</TableCell>
              <TableCell align="right">{t('movement-per-phase')}</TableCell>
              <TableCell align="right">{t('movement-ap-cost')}</TableCell>
              <TableCell align="right">{t('movement-free-penalty')}</TableCell>
              <TableCell align="right">{t('movement-max-load')}</TableCell>
              <TableCell>{t('movement-fatigue-check')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {PACES.map((row, index) => {
              const over = index > paceIndex(max.pace);
              return (
                <TableRow
                  key={row.id}
                  selected={row.id === roundPace}
                  sx={over ? { '& td': { color: 'text.disabled' } } : undefined}
                >
                  <TableCell>
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      {t(row.id)}
                    </Box>{' '}
                    ×{row.perRound}
                    {over && (
                      <Typography variant="caption" component="div">
                        {t('over-max-pace')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{inBoard(bmr * row.perRound)}</TableCell>
                  <TableCell align="right">{inBoard((bmr * row.perRound) / 4)}</TableCell>
                  <TableCell align="right">
                    {row.id === 'dash'
                      ? t('movement-ap-dash')
                      : row.ap > 0
                        ? t('movement-ap-n', { count: row.ap })
                        : '—'}
                  </TableCell>
                  <TableCell align="right">
                    {row.penalty === null ? t('movement-not-free') : row.penalty === 0 ? '—' : formatBonus(row.penalty)}
                  </TableCell>
                  <TableCell align="right">{row.load === null ? '—' : `${row.load}%`}</TableCell>
                  <TableCell>{row.check ? t(row.check) : '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default ActorRoundMovement;
