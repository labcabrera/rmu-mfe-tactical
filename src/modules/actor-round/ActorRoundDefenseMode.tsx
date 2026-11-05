import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ADRENAL_DEFENSE_FULL, ADRENAL_DEFENSE_PARTIAL, SectionLabel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { declareActorRoundDefenseMode } from '../api/actor-rounds';
import { ActorRound, DECLARABLE_DEFENSE_LEVELS, DefenseLevel } from '../api/actor-rounds.dto';
import { useTacticalNotify } from '../services/notify-service';

type DefenseKind = 'dodge' | 'block';
const DEFENSE_KINDS: DefenseKind[] = ['dodge', 'block'];

/** Level of the Adrenal Defense of the round (workspace spec 079, B3): 0 without one, negative after a failure. */
const adrenalDefenseLevel = (actorRound: ActorRound): number =>
  (actorRound.effects ?? [])
    .filter((e) => e.status === 'adrenal-defense' && (!e.fromRound || e.fromRound <= actorRound.round))
    .reduce((level, e) => (Math.abs(e.value ?? 0) > Math.abs(level) ? (e.value ?? 0) : level), 0);

/**
 * Dodge and shield block of the round (§9.6): none, passive or partial, declared by the game master. The full ones
 * take the whole round and come from completing a dodge action, so they are shown but not chosen here. A dodge and a
 * block of the same level do not add up, and an actor without a shield cannot block.
 */
const ActorRoundDefenseMode: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { game, displayRound, updateActorRound } = useContext(CombatContext)!;
  const [busy, setBusy] = useState(false);
  const mode = actorRound.defenseMode ?? { dodge: 'none', block: 'none' };
  const editable = !!game && game.status === 'in_progress' && displayRound === game.round;
  const hasShield = !!actorRound.defense?.shield;
  const adrenal = adrenalDefenseLevel(actorRound);

  const declare = (kind: DefenseKind, level: DefenseLevel | null) => {
    if (!level || level === mode[kind]) return;
    setBusy(true);
    declareActorRoundDefenseMode(actorRound.id, { [kind]: level }, auth)
      .then(updateActorRound)
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const row = (kind: DefenseKind) => {
    const other = mode[kind === 'dodge' ? 'block' : 'dodge'];
    // Workspace spec 079, B3: Adrenal Defense lets the game master declare a full dodge (level 2 or more)
    const adrenalFull = kind === 'dodge' && adrenal >= ADRENAL_DEFENSE_FULL;
    const levels: DefenseLevel[] =
      mode[kind] === 'full' || adrenalFull ? [...DECLARABLE_DEFENSE_LEVELS, 'full'] : DECLARABLE_DEFENSE_LEVELS;
    const disabled = !editable || busy || (kind === 'block' && !hasShield);
    const noDodge = kind === 'dodge' && adrenal < 0;
    return (
      <Stack key={kind} spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          {t(kind === 'dodge' ? 'dodge' : 'shield-block')}
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={mode[kind]}
          onChange={(_, value: DefenseLevel | null) => declare(kind, value)}
          aria-label={t(kind === 'dodge' ? 'dodge' : 'shield-block')}
          disabled={disabled}
        >
          {levels.map((level) => (
            <ToggleButton
              key={level}
              value={level}
              // Full is set by a dodge action; a level already taken by the other defence does not add up.
              disabled={
                disabled || (level === 'full' && !adrenalFull) || (level !== 'none' && (level === other || noDodge))
              }
              // Workspace spec 077, decision A2.1: a partial dodge or block needs concentration
              title={level === 'partial' ? t('concentration-required') : undefined}
            >
              {t(`${kind}-level-${level}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {kind === 'dodge' && adrenal !== 0 && (
          <Typography variant="caption" color={adrenal < 0 ? 'error.main' : 'success.main'}>
            {t(
              adrenal < 0
                ? 'adrenal-defense-no-dodge'
                : adrenal >= ADRENAL_DEFENSE_FULL
                  ? 'adrenal-defense-full-help'
                  : 'adrenal-defense-partial-help'
            )}
          </Typography>
        )}
        {mode[kind] === 'partial' && !(kind === 'dodge' && adrenal >= ADRENAL_DEFENSE_PARTIAL) && (
          <Typography variant="caption" color="info.main">
            {`${t('concentration-required')}: ${t('concentration-help')}`}
          </Typography>
        )}
      </Stack>
    );
  };

  return (
    <Stack spacing={1}>
      <SectionLabel>{t('defense-mode')}</SectionLabel>
      {DEFENSE_KINDS.map(row)}
      {!hasShield && (
        <Typography variant="caption" color="text.secondary">
          {t('defense-mode-no-shield')}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        {t('defense-mode-help')}
      </Typography>
    </Stack>
  );
};

export default ActorRoundDefenseMode;
