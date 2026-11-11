import { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, Typography } from '@mui/material';
import {
  ATTACK_MODES,
  AttackMode,
  ChipRow,
  DISARM_TWO_HANDED_PENALTY,
  disarmDefenseModifier,
  formatBonus,
  MELEE_COVER_DEFAULT,
  NumberPadField,
  RuleHint,
  SUBDUAL_UNFAMILIAR_ANATOMY_PENALTY,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionAttackModifiers, AttackDeclaration } from '../../../../api/action.dto';
import { useCombatRound } from '../../../../combat/combat-context';
import { AttackKind } from './attack-modifier-fields';
import ModifierTile from './pickers/ModifierTile';
import OptionTiles from './pickers/OptionTiles';

/**
 * Special maneuvers of one attack (workspace spec 079): the mode (a normal attack, a disarm of Table 9-7a or a
 * subdual of Table 9-7e) with what each one needs, and, for a ranged attack, the other combatants engaged in melee
 * with the target (§9.7), which give it cover and may take a stray shot. These fields belong to this attack only.
 */
const SpecialManeuverFields: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
  kind: AttackKind;
  /** An attack spell: it has no special maneuvers. */
  spell?: boolean;
  sourceActorId: string;
}> = ({ formData, setFormData, index, kind, spell = false, sourceActorId }) => {
  const { t } = useTranslation();
  const { actorRounds } = useCombatRound();
  const modifiers = formData.attacks?.[index]?.modifiers;
  if (!modifiers) return null;

  const set = (patch: Partial<ActionAttackModifiers>) =>
    setFormData((prev) => ({
      ...prev,
      attacks: prev.attacks.map((attack, i) =>
        i === index ? { ...attack, modifiers: { ...attack.modifiers, ...patch } } : attack
      ),
    }));

  const mode: AttackMode = modifiers.attackMode ?? 'normal';
  const setMode = (next: AttackMode) =>
    set({
      attackMode: next,
      // What the other modes asked for is cleared
      disarmDefenseRoll: next === 'disarm' ? (modifiers.disarmDefenseRoll ?? null) : null,
      disarmTwoHanded: next === 'disarm' ? !!modifiers.disarmTwoHanded : false,
      subdualBonus: next === 'subdual' ? (modifiers.subdualBonus ?? null) : null,
      unfamiliarAnatomy: next === 'subdual' ? !!modifiers.unfamiliarAnatomy : false,
    });

  const inTheWay = modifiers.meleeCoverActorIds ?? [];
  const toggleInTheWay = (actorId: string) =>
    set({
      meleeCoverActorIds: inTheWay.includes(actorId) ? inTheWay.filter((id) => id !== actorId) : [...inTheWay, actorId],
    });
  const candidates = (actorRounds ?? []).filter(
    (each) => each.actorId !== sourceActorId && each.actorId !== modifiers.targetId
  );
  const declaredCover = !!modifiers.cover && modifiers.cover !== 'none';

  return (
    <Stack spacing={2}>
      {!spell && (
        <Box>
          <OptionTiles
            label={t('attack-mode')}
            options={ATTACK_MODES.map((key) => ({ key, value: null }))}
            value={mode}
            onChange={(key) => setMode(key as AttackMode)}
            optionLabel={(option) => t(`attack-mode-${option.key}`)}
          />
          {mode !== 'normal' && (
            <RuleHint
              title={t(`attack-mode-${mode}`)}
              description={t(`combat-rule-${mode}`)}
              reference={mode === 'disarm' ? 'Table 9-7a' : 'Table 9-7e'}
            >
              <Typography variant="caption" color="text.secondary">
                {t(`attack-mode-${mode}-help`)}
              </Typography>
            </RuleHint>
          )}
        </Box>
      )}
      {mode === 'disarm' && (
        <Stack spacing={1.5}>
          <Box sx={{ maxWidth: 260 }}>
            <NumberPadField
              steps={[-10, -5, 5, 10]}
              label={t('disarm-defense-roll')}
              value={modifiers.disarmDefenseRoll ?? null}
              integer
              onChange={(value) => set({ disarmDefenseRoll: value })}
            />
            <Typography variant="caption" color="text.secondary" component="div">
              {typeof modifiers.disarmDefenseRoll === 'number'
                ? t('disarm-defense-roll-modifier', {
                    value: formatBonus(disarmDefenseModifier(modifiers.disarmDefenseRoll)),
                  })
                : t('disarm-defense-roll-help')}
            </Typography>
          </Box>
          <Box sx={{ maxWidth: 220 }}>
            <ModifierTile
              label={t('disarm-two-handed')}
              value={DISARM_TWO_HANDED_PENALTY}
              selected={!!modifiers.disarmTwoHanded}
              onClick={() => set({ disarmTwoHanded: !modifiers.disarmTwoHanded })}
            />
          </Box>
        </Stack>
      )}
      {mode === 'subdual' && (
        <Stack spacing={1.5}>
          <Box sx={{ maxWidth: 260 }}>
            <NumberPadField
              steps={[-10, -5, 5, 10]}
              label={t('subdual-bonus')}
              value={modifiers.subdualBonus ?? null}
              integer
              onChange={(value) => set({ subdualBonus: value })}
            />
            <Typography variant="caption" color="text.secondary" component="div">
              {t('subdual-bonus-help')}
            </Typography>
          </Box>
          <Box sx={{ maxWidth: 220 }}>
            <ModifierTile
              label={t('unfamiliar-anatomy')}
              value={SUBDUAL_UNFAMILIAR_ANATOMY_PENALTY}
              selected={!!modifiers.unfamiliarAnatomy}
              onClick={() => set({ unfamiliarAnatomy: !modifiers.unfamiliarAnatomy })}
            />
          </Box>
        </Stack>
      )}
      {kind === 'ranged' && (
        <Box>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
            {t('melee-cover-actors')}
          </Typography>
          {candidates.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('melee-cover-no-candidates')}
            </Typography>
          ) : (
            <ChipRow>
              {candidates.map((each) => (
                <Chip
                  key={each.actorId}
                  size="small"
                  label={each.actorName}
                  color={inTheWay.includes(each.actorId) ? 'primary' : 'default'}
                  variant={inTheWay.includes(each.actorId) ? 'filled' : 'outlined'}
                  onClick={() => toggleInTheWay(each.actorId)}
                />
              ))}
            </ChipRow>
          )}
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
            {inTheWay.length > 0 && declaredCover
              ? t('melee-cover-declared-help')
              : t('melee-cover-help', { value: formatBonus(MELEE_COVER_DEFAULT) })}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

export default SpecialManeuverFields;
