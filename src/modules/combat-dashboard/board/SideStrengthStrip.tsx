import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { SideStrengthBar, sideStrength, standingShare } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useCombatGame, useCombatRound } from '../../combat/combat-context';
import { useSides } from '../../hooks/useSides';

/** Cards shown side by side before the strip scrolls. */
const VISIBLE_CARDS = 3;

/**
 * Strength of every side of the combat (workspace spec 100, decision 14): one compact card per side with its levels
 * standing, incapacitated and fled, its combined hit points and its leader. More than three scroll sideways; a small
 * screen gets one line per side with its share standing. Hidden with a single side.
 */
const SideStrengthStrip: FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('sm'));
  const { game } = useCombatGame();
  const { actorRounds } = useCombatRound();
  const { sides, sideLabel, sideColor } = useSides();
  const strengths = useMemo(
    () =>
      sideStrength(
        actorRounds ?? [],
        sides.map((side) => ({ id: side.id, factionIds: side.factionIds }))
      ),
    [actorRounds, sides]
  );

  if (sides.length < 2 || !actorRounds) return null;

  const leaderName = (actorId: string | null) =>
    actorId
      ? (actorRounds.find((actorRound) => actorRound.actorId === actorId)?.actorName ??
        game?.actors.find((actor) => actor.id === actorId)?.name)
      : undefined;
  const rows = sides.flatMap((side) => {
    const strength = strengths.find((each) => each.sideId === side.id);
    return strength ? [{ side, strength }] : [];
  });

  if (compact) {
    return (
      <Stack spacing={0.5} aria-label={t('sides')}>
        {rows.map(({ side, strength }) => (
          <Stack key={side.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: sideColor(side), flexShrink: 0 }} />
            <Typography variant="body2" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
              {sideLabel(side)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {t('side-standing-percent', { percent: Math.round(standingShare(strength) * 100) })}
            </Typography>
          </Stack>
        ))}
      </Stack>
    );
  }

  const scrolls = rows.length > VISIBLE_CARDS;
  return (
    <Box
      sx={{ display: 'flex', gap: 1, overflowX: scrolls ? 'auto' : 'visible', pb: scrolls ? 0.5 : 0 }}
      aria-label={t('sides')}
    >
      {rows.map(({ side, strength }) => (
        <Paper
          key={side.id}
          variant="outlined"
          sx={{
            p: 1,
            minWidth: 0,
            flex: scrolls ? `0 0 calc((100% - ${theme.spacing(2)}) / ${VISIBLE_CARDS})` : '1 1 0',
          }}
        >
          <SideStrengthBar
            dense
            label={sideLabel(side)}
            color={sideColor(side)}
            strength={strength}
            leaderName={leaderName(side.leaderActorId)}
          />
        </Paper>
      ))}
    </Box>
  );
};

export default SideStrengthStrip;
