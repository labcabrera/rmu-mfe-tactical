import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BuildIcon from '@mui/icons-material/Build';
import {
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { ItemConditionChip } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { ActorRound, ActorRoundItem } from '../api/actor-rounds.dto';
import BreakageCheckDialog from '../combat-dashboard/actor-alert-dialogs/BreakageCheckDialog';
import { isRoundEditable } from '../services/game-service';

/**
 * Items of the actor (spec 019): its equipped and carried items with their strength and breakage. In the current
 * round of a game in progress, any of them can make a breakage check by hand (a maneuver with 33 or 77, or what the
 * game master asks for).
 */
const ActorRoundItems: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const { game, displayRound } = useContext(CombatContext)!;
  const editable = isRoundEditable(game, displayRound);
  const [checking, setChecking] = useState<ActorRoundItem | null>(null);
  const items = actorRound.items ?? [];

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{t('actor-items')}</Typography>
      {items.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('type')}</TableCell>
                <TableCell align="right">{t('breakage-strength')}</TableCell>
                <TableCell>{t('breakage')}</TableCell>
                {editable && <TableCell />}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.itemId} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {[t(`item-kind-${item.kind}`), item.slot && t(item.slot)].filter(Boolean).join(' · ')}
                  </TableCell>
                  <TableCell align="right">{item.strength ?? '-'}</TableCell>
                  <TableCell>
                    <ItemConditionChip condition={item.condition} showIntact />
                  </TableCell>
                  {editable && (
                    <TableCell align="right">
                      <Tooltip title={t('breakage-check-manual')}>
                        <IconButton
                          size="small"
                          aria-label={t('breakage-check-manual')}
                          onClick={() => setChecking(item)}
                        >
                          <BuildIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2">{t('actor-items-empty')}</Typography>
      )}
      {checking && (
        <BreakageCheckDialog actorRound={actorRound} itemId={checking.itemId} open onClose={() => setChecking(null)} />
      )}
    </Stack>
  );
};

export default ActorRoundItems;
