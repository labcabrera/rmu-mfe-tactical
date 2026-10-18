import React, { FC, KeyboardEvent, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import CasinoIcon from '@mui/icons-material/Casino';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { formatBonus, NumericInput, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { declareActorRoundInitiative } from '../../../api/actor-rounds';
import { ActorRound } from '../../../api/actor-rounds.dto';

/** One modifier of the initiative: its name on the left, its value on the right. */
const Modifier: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
    <Typography variant="caption" color="text.secondary" noWrap>
      {label}
    </Typography>
    <Typography variant="caption" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Typography>
  </Stack>
);

/** Initiative is a 2d10 roll. */
const roll2d10 = () => Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1;

/**
 * Initiative cell: the total, its modifiers one per line (base, penalty and roll), and, while initiative is declared, the 2d10 roll edited
 * in place (saved on blur or Enter) with a dice button. Actors that are down have no initiative.
 */
const ActorRoundInitiative: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const { game, displayRound, updateActorRound } = useContext(CombatContext)!;
  const isDown = actorRound.effects.some((e) => e.status === 'dead' || e.status === 'unconcious');
  const editable = !isDown && game?.phase === 'declare_initiative' && displayRound === game?.round;
  const { base = 0, penalty = 0, roll, total } = actorRound.initiative ?? {};
  const declared = !!roll;

  const declare = (value: number | null) => {
    if (!value || value === roll) return;
    declareActorRoundInitiative(actorRound.id, value, auth)
      .then(updateActorRound)
      .catch((err) => notify.error(err));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      e.target.blur();
    }
  };

  if (isDown) {
    return (
      <Box sx={{ p: 1.25 }}>
        <Typography variant="h6" color="text.disabled">
          —
        </Typography>
      </Box>
    );
  }

  return (
    <Stack sx={{ p: 1.25, gap: 0.75 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
        <Typography variant="h6" component="span" color={declared ? 'text.primary' : 'text.disabled'}>
          {declared ? total : '—'}
        </Typography>
        {!declared && (
          <Typography variant="caption" color="warning.main">
            {t('not-declared')}
          </Typography>
        )}
      </Stack>
      {/* One per line: side by side they did not fit in the column. */}
      <Stack>
        <Modifier label={t('base')} value={formatBonus(base)} />
        <Modifier label={t('penalty')} value={formatBonus(penalty)} />
        {declared && !editable && <Modifier label={t('roll')} value={String(roll)} />}
      </Stack>
      {editable && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }} onKeyDown={onKeyDown}>
          <NumericInput
            label={t('initiative-roll')}
            value={roll || null}
            onChange={declare}
            min={2}
            max={20}
            integer
            allowNegatives={false}
          />
          <Tooltip title={t('roll-dice')}>
            <IconButton aria-label={t('roll-dice')} onClick={() => declare(roll2d10())}>
              <CasinoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
    </Stack>
  );
};

export default ActorRoundInitiative;
