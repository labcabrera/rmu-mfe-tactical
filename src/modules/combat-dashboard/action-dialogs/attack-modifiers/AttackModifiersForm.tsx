import React, { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionAttackModifiers, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import {
  AttackKind,
  ChoiceField,
  declaredValue,
  FlagField,
  ModifierField,
  ModifierFieldGroup,
  ModifierSection,
  MODIFIER_SECTIONS,
  fieldsFor,
  isDeclared,
} from './attack-modifier-fields';
import CalledShotPicker from './pickers/CalledShotPicker';
import CoverPicker from './pickers/CoverPicker';
import ModifierTile from './pickers/ModifierTile';
import OptionTiles from './pickers/OptionTiles';
import PositionPicker from './pickers/PositionPicker';

const GROUPS: ModifierFieldGroup[] = ['offense', 'defense', 'situation'];

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

/** Flags pre-filled from the target's effects (the attacker can still change them). */
const fromTargetEffects = (target: ActorRound | undefined): Partial<Record<keyof ActionAttackModifiers, boolean>> => {
  const statuses = new Set(target?.effects?.map((effect) => effect.status) ?? []);
  return {
    stunnedFoe: statuses.has('stunned'),
    surprisedFoe: statuses.has('surprised'),
    proneTarget: statuses.has('prone'),
  };
};

/**
 * Modifiers of one attack, for melee and ranged, in three sections: what adds to or subtracts from the roll (by
 * attacker, target and situation), how the target defends, and special options. Every control is a same-size
 * tile, with visual pickers for the called shot, the cover and the side of the attack; a preview beside them adds
 * up the OB and the declared values. Target fields are shared by every attack against the same target.
 */
const AttackModifiersForm: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
  kind: AttackKind;
  target: ActorRound | undefined;
  /** Extra controls of the situation group, e.g. the range of a ranged attack. */
  situationExtra?: ReactNode;
}> = ({ formData, setFormData, index, kind, target, situationExtra }) => {
  const { t } = useTranslation();
  const modifiers = formData.attacks?.[index]?.modifiers;
  if (!modifiers) return null;

  const auto = fromTargetEffects(target);
  const fields = fieldsFor(kind);

  const change = (field: ModifierField, value: unknown) => {
    setFormData((prev) => {
      const targetId = prev.attacks[index]?.modifiers.targetId;
      const shared = field.group === 'defense' && !!targetId;
      const attacks = prev.attacks.map((attack, i) => {
        const applies = i === index || (shared && attack.modifiers.targetId === targetId);
        if (!applies) return attack;
        const next = { ...attack.modifiers, [field.name]: value };
        // A called shot starts with the usual penalty; going back to none clears it.
        if (field.name === 'calledShot')
          next.calledShotPenalty = value === 'none' ? 0 : (attack.modifiers.calledShotPenalty ?? -25) || -25;
        return { ...attack, modifiers: next };
      });
      return { ...prev, attacks };
    });
  };

  // The called shot penalty belongs to this attack only (it is not a target field).
  const setNumber = (name: keyof ActionAttackModifiers, value: number | null) =>
    setFormData((prev) => ({
      ...prev,
      attacks: prev.attacks.map((attack, i) =>
        i === index ? { ...attack, modifiers: { ...attack.modifiers, [name]: value } } : attack
      ),
    }));

  const declaredIn = (section: ModifierSection) =>
    fields
      .filter((field) => field.section === section && field.name !== 'calledShotPenalty')
      .filter((field) => isDeclared(field, modifiers));
  const rollDeclared = declaredIn('roll');
  const rollSum = rollDeclared.reduce((sum, field) => sum + (declaredValue(field, modifiers, kind) ?? 0), 0);
  const otherDeclared = [...declaredIn('defender'), ...declaredIn('special')];
  const choiceValue = (field: ChoiceField) =>
    (modifiers[field.name] as string | null | undefined) || field.defaultValue;
  const declaredLabel = (field: ModifierField) =>
    field.kind === 'choice' ? `${t(field.label)}: ${t(String(modifiers[field.name]))}` : t(field.label);

  const renderFlag = (field: FlagField) => (
    <ModifierTile
      key={field.name}
      label={t(field.label)}
      value={field.bonus(kind)}
      selected={modifiers[field.name] === true}
      auto={modifiers[field.name] === true && auto[field.name] ? t('from-target-effect') : undefined}
      onClick={() => change(field, modifiers[field.name] !== true)}
    />
  );

  const renderField = (field: ModifierField) => {
    if (field.kind === 'choice' && field.name === 'calledShot')
      return (
        <CalledShotPicker
          value={choiceValue(field)}
          penalty={modifiers.calledShotPenalty}
          onChange={(zone) => change(field, zone)}
          onPenalty={(value) => setNumber('calledShotPenalty', value)}
        />
      );
    if (field.kind === 'choice' && field.name === 'cover')
      return (
        <CoverPicker options={field.options(kind)} value={choiceValue(field)} onChange={(key) => change(field, key)} />
      );
    if (field.kind === 'choice' && field.name === 'positionalTarget')
      return (
        <PositionPicker
          options={field.options(kind)}
          value={choiceValue(field)}
          onChange={(key) => change(field, key)}
        />
      );
    if (field.kind === 'choice')
      return (
        <OptionTiles
          label={t(field.label)}
          options={field.options(kind)}
          value={choiceValue(field)}
          onChange={(key) => change(field, key)}
        />
      );
    if (field.kind === 'number')
      return (
        <Box sx={{ maxWidth: 220 }}>
          <NumericInput
            label={t(field.label)}
            value={(modifiers[field.name] as number | null) || null}
            integer
            onChange={(value) => change(field, value)}
          />
        </Box>
      );
    return null;
  };

  /** Flags as a grid of same-size tiles, then the other controls one per row. */
  const renderFields = (list: ModifierField[]) => {
    const flags = list.filter((field): field is FlagField => field.kind === 'flag');
    const others = list.filter((field) => field.kind !== 'flag' && field.name !== 'calledShotPenalty');
    return (
      <Stack spacing={2}>
        {flags.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 1 }}>
            {flags.map(renderFlag)}
          </Box>
        )}
        {others.map((field) => (
          <Box key={field.name}>{renderField(field)}</Box>
        ))}
      </Stack>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8, xl: 9 }}>
        {/* On wide screens the roll section spans the whole width and the others go side by side, so the
            modifiers fit in view with little scrolling. */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
          {MODIFIER_SECTIONS.map((section) => {
            const list = fields.filter((field) => field.section === section);
            if (list.length === 0) return null;
            return (
              <Card
                key={section}
                component="section"
                aria-label={t(`modifier-section-${section}`)}
                sx={{ gridColumn: section === 'roll' ? '1 / -1' : undefined }}
              >
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {t(`modifier-section-${section}`)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t(`modifier-section-${section}-help`)}
                  </Typography>
                  {section === 'roll' ? (
                    // Its groups side by side when they fit.
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 3 }}>
                      {GROUPS.map((group) => {
                        const groupFields = list.filter((field) => field.group === group);
                        if (groupFields.length === 0 && !(group === 'situation' && situationExtra)) return null;
                        return (
                          <Box key={group}>
                            <Typography variant="overline" color="text.secondary">
                              {t(`modifier-group-${group}`)}
                            </Typography>
                            {renderFields(groupFields)}
                            {group === 'situation' && situationExtra && <Box sx={{ mt: 2 }}>{situationExtra}</Box>}
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    renderFields(list)
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 4, xl: 3 }}>
        <Card sx={{ position: { md: 'sticky' }, top: { md: 0 } }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('roll-preview')}
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1.5 }}>
              <PreviewRow label={t('used-ob')} value={modifiers.bo ?? 0} plain />
              {rollDeclared.map((field) => (
                <PreviewRow
                  key={field.name}
                  label={declaredLabel(field)}
                  value={declaredValue(field, modifiers, kind)}
                />
              ))}
              <Divider sx={{ my: 0.5 }} />
              <PreviewRow label={t('estimated-total')} value={(modifiers.bo ?? 0) + rollSum} plain strong />
            </Stack>
            {otherDeclared.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('other-declared-options')}
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {otherDeclared.map((field) => (
                    <Chip key={field.name} size="small" label={declaredLabel(field)} />
                  ))}
                </Stack>
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 2 }}>
              {t('roll-preview-note')}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

/** A line of the roll preview: a modifier with its signed value (green or red), or a plain number. */
const PreviewRow: FC<{ label: string; value: number | null; plain?: boolean; strong?: boolean }> = ({
  label,
  value,
  plain = false,
  strong = false,
}) => {
  let color = 'text.primary';
  if (!plain && value) color = value > 0 ? 'success.main' : 'error.main';
  let shown = '—';
  if (value !== null) shown = plain ? `${value}` : signed(value);
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography
        variant="body2"
        color={strong ? 'text.primary' : 'text.secondary'}
        sx={{ fontWeight: strong ? 700 : 400 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }} color={color}>
        {shown}
      </Typography>
    </Stack>
  );
};

export default AttackModifiersForm;
