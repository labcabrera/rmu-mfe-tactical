import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { formatBonus, RollField, TWO_D10 } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { declareActorRoundInitiative } from '../../../api/actor-rounds';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { isActorRoundDown, isActorRoundFlatfooted } from '../../../services/actor-round-service';
import { isRoundEditable } from '../../../services/game-service';
import { useTacticalNotify } from '../../../services/notify-service';

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

/** Trait that lets the actor add a bonus to its initiative when it declares it (spec 008). */
const STRIKE_REFLEX = 'strike-reflex';

/**
 * Initiative cell: the total, its modifiers one per line (base, penalty and roll), and, while initiative is declared, the 2d10 roll entered
 * with the roll keypad or its dice button (spec 025). Actors that are down have no initiative.
 */
const ActorRoundInitiative: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { game, displayRound, updateActorRound } = useContext(CombatContext)!;
  const isDown = isActorRoundDown(actorRound);
  const flatfooted = isActorRoundFlatfooted(actorRound);
  const editable =
    !isDown && !flatfooted && isRoundEditable(game, displayRound) && game?.phase === 'declare_initiative';
  const { base = 0, penalty = 0, roll, total, strikeReflex: strikeReflexBonus, style } = actorRound.initiative ?? {};
  const declared = !!roll;
  const hasStrikeReflex = (actorRound.traits ?? []).some((trait) => trait.traitId === STRIKE_REFLEX);
  const [strikeReflex, setStrikeReflex] = useState(!!strikeReflexBonus);

  useEffect(() => setStrikeReflex(!!strikeReflexBonus), [strikeReflexBonus]);

  const send = (value: number, useStrikeReflex: boolean) => {
    declareActorRoundInitiative(actorRound.id, value, auth, hasStrikeReflex ? useStrikeReflex : undefined)
      .then(updateActorRound)
      .catch((err) => notify.error(err));
  };

  const declare = (value: number | null) => {
    if (!value || value === roll) return;
    send(value, strikeReflex);
  };

  /** The choice is sent with the roll; once the roll is declared, changing it declares the same roll again. */
  const toggleStrikeReflex = (checked: boolean) => {
    setStrikeReflex(checked);
    if (roll) send(roll, checked);
  };

  if (isDown || (flatfooted && !declared)) {
    return (
      <Box sx={{ p: 1.25 }}>
        <Typography variant="h6" color="text.disabled">
          —
        </Typography>
        {flatfooted && !isDown && (
          <Typography variant="caption" color="warning.main">
            {t('flatfooted-no-initiative')}
          </Typography>
        )}
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
        {!!strikeReflexBonus && <Modifier label={t('strike-reflex')} value={formatBonus(strikeReflexBonus)} />}
        {!!style && <Modifier label={t('style-ability-lightning-reflexes')} value={formatBonus(style)} />}
        {declared && !editable && <Modifier label={t('roll')} value={String(roll)} />}
      </Stack>
      {editable && (
        <RollField
          spec={TWO_D10}
          label={t('initiative-roll')}
          value={roll || null}
          onChange={(value) => declare(value.total)}
          compact
        />
      )}
      {editable && hasStrikeReflex && (
        <FormControlLabel
          control={
            <Checkbox size="small" checked={strikeReflex} onChange={(e) => toggleStrikeReflex(e.target.checked)} />
          }
          label={<Typography variant="caption">{t('strike-reflex')}</Typography>}
        />
      )}
    </Stack>
  );
};

export default ActorRoundInitiative;
