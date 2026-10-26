import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Checkbox, Chip, FormControlLabel, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { CombatContext } from '../../CombatContext';
import { declareActorRoundFightingStyle } from '../api/actor-rounds';
import { ActiveStyleAbility, ActorRound, OPTIONAL_STYLE_ABILITIES } from '../api/actor-rounds.dto';
import { useTacticalNotify } from '../services/notify-service';

const NONE = 'none';

/** Abilities the combat calculator applies by itself; the rest are reminders for the game master. */
const AUTOMATED_ABILITIES = [
  'lightning-reflexes',
  'point-blank-shot',
  'trick-shot',
  'precise-target',
  'evade-shield',
  'off-hand-dagger',
  'off-hand-light-weapon',
  'killing-strike',
  'heedless-fury',
  'improved-parry',
  'unarmed-parry',
];

const styleKey = (skillId: string, styleId: string) => `${skillId}@${styleId}`;

/**
 * Fighting style of the round (spec 032): the actor fights in one of its styles, kept in the next rounds until
 * changed. The style gives nothing without its equipment; the free ranks add OB and the abilities apply on their own
 * when the calculator knows them.
 */
const ActorRoundFightingStyle: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { game, displayRound, updateActorRound } = useContext(CombatContext)!;
  const [busy, setBusy] = useState(false);
  const styles = actorRound.fightingStyles ?? [];
  const active = actorRound.activeStyle ?? null;
  const editable = !!game && game.status === 'in_progress' && displayRound === game.round && !busy;

  if (styles.length === 0) return null;

  const declare = (value: string, options: string[] = []) => {
    const style = styles.find((s) => styleKey(s.skillId, s.styleId) === value);
    setBusy(true);
    declareActorRoundFightingStyle(
      actorRound.id,
      style ? { skillId: style.skillId, styleId: style.styleId, options } : {},
      auth
    )
      .then(updateActorRound)
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const toggleOption = (abilityId: string, checked: boolean) => {
    if (!active) return;
    const options = checked ? [...active.options, abilityId] : active.options.filter((o) => o !== abilityId);
    declare(styleKey(active.skillId, active.styleId), options);
  };

  const abilityChip = (ability: ActiveStyleAbility) => {
    const automated = AUTOMATED_ABILITIES.includes(ability.abilityId);
    const name = t(`style-ability-${ability.abilityId}`);
    const label = ability.times > 1 ? `${name} ×${ability.times}` : name;
    const help = !ability.met
      ? t('style-ability-equipment-not-met')
      : automated
        ? t('style-ability-automated')
        : t('style-ability-reminder');
    return (
      <Tooltip key={ability.abilityId} title={help}>
        <Chip
          size="small"
          label={label}
          color={ability.met && automated ? 'success' : 'default'}
          variant={ability.met ? 'filled' : 'outlined'}
          sx={{ opacity: ability.met ? 1 : 0.6 }}
        />
      </Tooltip>
    );
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{t('fighting-style')}</Typography>
      <TextField
        select
        size="small"
        label={t('active-style')}
        value={active ? styleKey(active.skillId, active.styleId) : NONE}
        onChange={(e) => declare(e.target.value)}
        disabled={!editable}
      >
        <MenuItem value={NONE}>{t('no-fighting-style')}</MenuItem>
        {styles.map((s) => (
          <MenuItem key={styleKey(s.skillId, s.styleId)} value={styleKey(s.skillId, s.styleId)}>
            {`${t(s.styleId)} (${t(s.skillId)} ${s.ranks})`}
          </MenuItem>
        ))}
      </TextField>
      {active && (
        <>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
            {active.met ? (
              <Chip size="small" color="success" label={t('style-free-ranks-ob', { bonus: active.freeRanksBonus })} />
            ) : (
              <Chip size="small" color="warning" label={t('style-equipment-not-met')} />
            )}
            {active.met && active.attackNames && (
              <Chip
                size="small"
                variant="outlined"
                label={t('style-attacks', { attacks: active.attackNames.map((a) => t(a)).join(', ') })}
              />
            )}
            {active.warnings.map((warning) => (
              <Chip
                key={warning}
                size="small"
                color="warning"
                variant="outlined"
                label={t(`style-warning-${warning}`)}
              />
            ))}
          </Stack>
          {active.abilities.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
              {active.abilities.map(abilityChip)}
            </Stack>
          )}
          {active.abilities
            .filter((a) => OPTIONAL_STYLE_ABILITIES.includes(a.abilityId))
            .map((a) => (
              <FormControlLabel
                key={a.abilityId}
                control={
                  <Checkbox
                    size="small"
                    checked={active.options.includes(a.abilityId)}
                    disabled={!editable || !a.met}
                    onChange={(e) => toggleOption(a.abilityId, e.target.checked)}
                  />
                }
                label={<Typography variant="body2">{t(`style-option-${a.abilityId}`)}</Typography>}
              />
            ))}
        </>
      )}
      <Typography variant="caption" color="text.secondary">
        {t('fighting-style-help')}
      </Typography>
    </Stack>
  );
};

export default ActorRoundFightingStyle;
