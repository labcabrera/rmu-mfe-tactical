import { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Divider, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ChipRow, NumberPadField, OptionGroup, Panel, signed } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionAttackModifiers, AttackDeclaration } from '../../../../api/action.dto';
import { ActorRound } from '../../../../api/actor-rounds.dto';
import {
  AttackKind,
  ChoiceField,
  declaredValue,
  FlagField,
  ModifierField,
  ModifierFieldGroup,
  ModifierSection,
  fieldsFor,
  isDeclared,
} from './attack-modifier-fields';
import CalledShotPicker from './pickers/CalledShotPicker';
import CoverPicker from './pickers/CoverPicker';
import OptionTiles from './pickers/OptionTiles';
import { specialManeuverPreview } from './special-maneuvers';

const GROUPS: ModifierFieldGroup[] = ['offense', 'defense', 'situation'];

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
  /** Extra controls of the special section: the disarm, the subdual and the combatants in the way (spec 079). */
  specialExtra?: ReactNode;
  /** Talents of the attacker: some fields only show with them (Extra Joints, workspace spec 079). */
  attackerTraits?: string[];
  /** A line under a field: the distance moved in the round under the charge. */
  fieldHelp?: Partial<Record<keyof ActionAttackModifiers, string>>;
}> = ({ formData, setFormData, index, kind, target, situationExtra, specialExtra, attackerTraits, fieldHelp }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('xl'));
  const medium = useMediaQuery(theme.breakpoints.up('lg'));
  const columnCount = wide ? 3 : medium ? 2 : 1;
  const modifiers = formData.attacks?.[index]?.modifiers;
  if (!modifiers) return null;

  const auto = fromTargetEffects(target);
  const fields = fieldsFor(kind, attackerTraits);

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
  // Workspace spec 079, A6-A7: the fixed values of the special maneuvers (the table penalty and the skill come from the API)
  const specialRows = specialManeuverPreview(modifiers, kind);
  const rollSum =
    rollDeclared.reduce((sum, field) => sum + (declaredValue(field, modifiers, kind) ?? 0), 0) +
    specialRows.reduce((sum, row) => sum + (row.value ?? 0), 0);
  const otherDeclared = [...declaredIn('defender'), ...declaredIn('special')];
  const choiceValue = (field: ChoiceField) =>
    (modifiers[field.name] as string | null | undefined) || field.defaultValue;
  const optionText = (field: ChoiceField, key: string) => t(`${field.optionKeyPrefix ?? ''}${key}`);
  const declaredLabel = (field: ModifierField) =>
    field.kind === 'choice' ? `${t(field.label)}: ${optionText(field, String(modifiers[field.name]))}` : t(field.label);

  /** The flags of a list as toggle chips with their values (workspace spec 085, 3.1). */
  const renderFlags = (flags: FlagField[]) => (
    <OptionGroup
      multiple
      options={flags.map((field) => {
        const fromEffect = modifiers[field.name] === true && !!auto[field.name];
        return {
          key: field.name,
          label: t(field.label),
          value: field.bonus(kind),
          auto: fromEffect,
          hint: fromEffect ? t('from-target-effect') : undefined,
        };
      })}
      value={flags.filter((field) => modifiers[field.name] === true).map((field) => field.name)}
      onChange={(keys) => {
        const toggled = flags.find((field) => keys.includes(field.name) !== (modifiers[field.name] === true));
        if (toggled) change(toggled, !(modifiers[toggled.name] === true));
      }}
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
    if (field.kind === 'choice')
      return (
        <OptionTiles
          label={t(field.label)}
          options={field.options(kind)}
          value={choiceValue(field)}
          onChange={(key) => change(field, key)}
          optionLabel={field.optionKeyPrefix ? (option) => optionText(field, option.key) : undefined}
        />
      );
    if (field.kind === 'number')
      return (
        <Box sx={{ maxWidth: 220 }}>
          <NumberPadField
            steps={[-10, -5, 5, 10]}
            label={t(field.label)}
            value={(modifiers[field.name] as number | null) || null}
            integer
            onChange={(value) => change(field, value)}
          />
        </Box>
      );
    return null;
  };

  /** The choices one per row, then the flags together as chips. */
  const renderFields = (list: ModifierField[]) => {
    const flags = list.filter((field): field is FlagField => field.kind === 'flag');
    const others = list.filter((field) => field.kind !== 'flag' && field.name !== 'calledShotPenalty');
    return (
      <Stack spacing={2}>
        {others.map((field) => (
          <Box key={field.name}>
            {renderField(field)}
            {fieldHelp?.[field.name] && (
              <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
                {fieldHelp[field.name]}
              </Typography>
            )}
          </Box>
        ))}
        {flags.length > 0 && renderFlags(flags)}
      </Stack>
    );
  };

  const estimatedTotal = (modifiers.bo ?? 0) + rollSum;

  // The blocks of the form: the three groups of the roll, then the target's defense and the special options.
  type Block = { key: string; title: string; help?: string; content: ReactNode };
  const blocks: Block[] = [];
  const rollFields = fields.filter((field) => field.section === 'roll');
  GROUPS.forEach((group) => {
    const groupFields = rollFields.filter((field) => field.group === group);
    const extra = group === 'situation' ? situationExtra : undefined;
    if (groupFields.length === 0 && !extra) return;
    blocks.push({
      key: group,
      title: t(`modifier-group-${group}`),
      content: (
        <>
          {renderFields(groupFields)}
          {extra && <Box sx={{ mt: 2 }}>{extra}</Box>}
        </>
      ),
    });
  });
  (['defender', 'special'] as ModifierSection[]).forEach((section) => {
    const list = fields.filter((field) => field.section === section);
    const extra = section === 'special' ? specialExtra : undefined;
    if (list.length === 0 && !extra) return;
    blocks.push({
      key: section,
      title: t(`modifier-section-${section}`),
      help: t(`modifier-section-${section}-help`),
      content: (
        <>
          {renderFields(list)}
          {extra && <Box sx={{ mt: 2 }}>{extra}</Box>}
        </>
      ),
    });
  });

  // Fixed columns by width (not a masonry, so that a block does not jump to another column when it grows): the
  // attacker and the target together, the situation alone, the defense and the special options together.
  const columnKeys: string[][] =
    columnCount === 3
      ? [['offense', 'defense'], ['situation'], ['defender', 'special']]
      : columnCount === 2
        ? [
            ['offense', 'defense', 'defender'],
            ['situation', 'special'],
          ]
        : [['offense', 'defense', 'situation', 'defender', 'special']];
  const columns = columnKeys
    .map((keys) =>
      keys.map((key) => blocks.find((block) => block.key === key)).filter((block): block is Block => !!block)
    )
    .filter((column) => column.length > 0);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} useFlexGap sx={{ gap: 2, alignItems: { md: 'flex-start' } }}>
      <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {t('modifier-section-roll-help')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
            gap: 2,
            alignItems: 'start',
          }}
        >
          {columns.map((column, index) => (
            <Stack key={index} spacing={2}>
              {column.map((block) => (
                <Box key={block.key} component="section" aria-label={block.title}>
                  <Panel title={block.title} sx={{ height: 'auto' }}>
                    {block.help && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {block.help}
                      </Typography>
                    )}
                    {block.content}
                  </Panel>
                </Box>
              ))}
            </Stack>
          ))}
        </Box>
      </Box>
      {/* Workspace spec 085, 3.2: the estimate stays in view while the modifiers scroll */}
      {/* On narrow tablets it goes first, above the modifiers */}
      <Box
        sx={{
          width: { xs: '100%', md: 280 },
          flexShrink: 0,
          order: { xs: -1, md: 0 },
          position: { md: 'sticky' },
          top: { md: 8 },
        }}
      >
        <Panel title={t('roll-preview')} sx={{ height: 'auto' }}>
          <Stack spacing={0.5}>
            <PreviewRow label={t('used-ob')} value={modifiers.bo ?? 0} plain />
            {rollDeclared.map((field) => (
              <PreviewRow key={field.name} label={declaredLabel(field)} value={declaredValue(field, modifiers, kind)} />
            ))}
            {specialRows.map((row) => (
              <PreviewRow key={row.key} label={t(`modifier-label-${row.key}`)} value={row.value} />
            ))}
            <Divider sx={{ my: 0.5 }} />
            <PreviewRow label={t('estimated-total')} value={estimatedTotal} plain strong />
          </Stack>
          {otherDeclared.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {t('other-declared-options')}
              </Typography>
              <ChipRow sx={{ mt: 0.5 }}>
                {otherDeclared.map((field) => (
                  <Chip key={field.name} size="small" label={declaredLabel(field)} />
                ))}
              </ChipRow>
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 2 }}>
            {t('roll-preview-note')}
          </Typography>
        </Panel>
      </Box>
    </Stack>
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
        sx={{ fontWeight: strong ? 600 : 400 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }} color={color}>
        {shown}
      </Typography>
    </Stack>
  );
};

export default AttackModifiersForm;
