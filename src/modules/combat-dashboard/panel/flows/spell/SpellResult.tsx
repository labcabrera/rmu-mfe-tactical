import React, { ComponentProps, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
import { formatBonus, RollBreakdown, SpellEffectList } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionSpell, ActionSpellTarget } from '../../../../api/action.dto';

/** Spells whose targets take a resistance roll (spec 028 `resistance.kind`), as the API decides. */
const RR_KINDS = ['realm', 'informational', 'willing'];

export const spellAllowsRr = (spell: ActionSpell): boolean =>
  spell.result === 'success' && RR_KINDS.includes(spell.spell.resistance?.kind ?? '');

/** Short outcome of a target: affected or not, and by how much its RR fell short. */
export const targetOutcome = (target: ActionSpellTarget, t: TFunction): string =>
  target.resisted
    ? t('spell-target-resists', { name: target.actorName ?? target.actorId, total: target.total, required: target.required })
    : target.rolled
      ? t('spell-target-affected', {
          name: target.actorName ?? target.actorId,
          total: target.total,
          required: target.required,
          failure: target.failure,
        })
      : t('spell-target-willing', { name: target.actorName ?? target.actorId });

/**
 * The Spellcasting Roll of a cast with its breakdown and what it means (Spell Law 4.2): above 0 the spell is cast, 0
 * has no effect and the power points are lost, below 0 it fails and takes a roll on the spell failure table, shown
 * here once rolled (Tables 4-4, as text).
 */
export const SpellCastingResult: FC<{ spell: ActionSpell }> = ({ spell }) => {
  const { t } = useTranslation();
  if (!spell.roll || !spell.result) return null;
  const scr = spell.roll.totalRoll;
  return (
    <Stack spacing={2}>
      <RollBreakdown modifiers={spell.roll.modifiers} roll={spell.roll.roll} total={scr} totalLabel={t('spell-scr')} />
      {spell.result === 'success' && (
        <Alert severity="success">
          {t(spellAllowsRr(spell) ? 'spell-cast-success-rr' : 'spell-cast-success', { scr })}
        </Alert>
      )}
      {spell.result === 'no-effect' && <Alert severity="info">{t('spell-cast-no-effect')}</Alert>}
      {spell.result === 'failure' && (
        <Alert severity="error">{t(spell.failure ? 'spell-cast-failure' : 'spell-cast-failure-roll', { scr })}</Alert>
      )}
      {spell.failure && (
        <Box>
          <Typography variant="subtitle2">
            {`${t('spell-failure')} (${t(spell.failure.realm)}): ${spell.failure.roll} ${formatBonus(spell.failure.modifier)} = ${spell.failure.total}`}
          </Typography>
          <Typography variant="body2" sx={{ my: 0.5 }}>
            {spell.failure.text}
          </Typography>
          <Chip size="small" label={t(`spell-failure-pp-${spell.failure.suggestedPp}`)} />
        </Box>
      )}
    </Stack>
  );
};

/** How a resistance roll against the spell works, with the numbers of this cast (Spell Law 4.5). */
export const SpellResistanceHelp: FC<{ spell: ActionSpell }> = ({ spell }) => {
  const { t } = useTranslation();
  return (
    <Typography variant="body2" color="text.secondary">
      {t('spell-rr-help', {
        realm: spell.spell.listRealms.map((realm) => t(realm)).join(' / '),
        level: spell.caster.level,
        levelModifier: formatBonus(-2 * spell.caster.level),
        spellPart: spell.spell.resistance?.modifier
          ? t('spell-rr-help-spell', { modifier: formatBonus(spell.spell.resistance.modifier) })
          : '',
        scr: spell.roll?.totalRoll ?? 0,
      })}
    </Typography>
  );
};

/** Resistance rolls of the targets: each one's breakdown and whether it resisted. */
export const SpellResistanceResults: FC<{ spell: ActionSpell }> = ({ spell }) => {
  const { t } = useTranslation();
  const targets = spell.targets ?? [];
  if (targets.length === 0) return null;
  return (
    <Stack spacing={1.5}>
      {targets.map((target) => (
        <Box key={target.actorId}>
          <Alert severity={target.resisted ? 'info' : 'warning'} sx={{ mb: target.rolled ? 1 : 0 }}>
            {targetOutcome(target, t)}
          </Alert>
          {target.rolled && (
            <RollBreakdown
              modifiers={target.breakdown.filter((modifier) => modifier.key !== 'roll')}
              roll={target.roll}
              total={target.total ?? undefined}
              totalLabel={t('spell-rr-total', { required: target.required })}
            />
          )}
        </Box>
      ))}
    </Stack>
  );
};

/**
 * What the cast did, in words: who is affected (the targets that did not resist), the spell's effects (shown for the
 * game master to apply: they are not applied by themselves) and the power points.
 */
export const SpellOutcome: FC<{ spell: ActionSpell }> = ({ spell }) => {
  const { t } = useTranslation();
  const effects = spell.spell.effects as ComponentProps<typeof SpellEffectList>['effects'];
  const targets = spell.targets ?? [];
  const affected = targets.filter((target) => !target.resisted);
  return (
    <Stack spacing={1.5}>
      {spell.result === 'failure' && <Alert severity="error">{t('spell-outcome-failure')}</Alert>}
      {spell.result === 'no-effect' && <Alert severity="info">{t('spell-outcome-no-effect')}</Alert>}
      {spell.result === 'success' && spellAllowsRr(spell) && targets.length === 0 && (
        <Alert severity="warning">{t('spell-outcome-no-rr')}</Alert>
      )}
      {spell.result === 'success' && targets.length > 0 && (
        <Alert severity={affected.length > 0 ? 'warning' : 'info'}>
          {affected.length > 0
            ? t('spell-outcome-affected', { names: affected.map((target) => target.actorName ?? target.actorId).join(', ') })
            : t('spell-outcome-all-resist')}
        </Alert>
      )}
      {spell.result === 'success' && !spellAllowsRr(spell) && <Alert severity="success">{t('spell-outcome-no-rr-needed')}</Alert>}
      {spell.result === 'success' && effects && effects.length > 0 && (
        <Box>
          <Typography variant="subtitle2">{t('spell-effects')}</Typography>
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 0.5 }}>
            {t('spell-effects-manual')}
          </Typography>
          <SpellEffectList effects={effects} />
        </Box>
      )}
      {spell.powerPointsSpent !== null && spell.powerPointsSpent !== undefined && (
        <Typography variant="body2">{t('spell-power-points-spent', { count: spell.powerPointsSpent })}</Typography>
      )}
    </Stack>
  );
};
