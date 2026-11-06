import React, { FC, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { CharacterPicker, formatBonus, NumberPadField, Panel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { ActionAttack, PROTECT_POSITIONS, ProtectPosition } from '../../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../../api/actor-rounds.dto';
import { useActorRoundOption } from '../../../../services/actor-round-option';
import SelectAttackRange from '../../../../shared/selects/SelectAttackRange';
import AttackSizeVsTarget from './AttackSizeVsTarget';
import TargetPicker from './TargetPicker';
import { attackLabel } from './attack-label';
import { AttackKind } from './useAttackDeclaration';

/**
 * First step of an attack: for each weapon, its target (inline), the OB it uses, and its protectors (melee), each
 * with where it stands (Table 9-7c), or its range (ranged). Weapons without a target are not declared.
 */
const AttackTargetsStep: FC<{
  kind: AttackKind;
  actorRound: ActorRound;
  /** What each attack strikes with: the actor's weapons or a spell's attack. */
  sourceAttacks: ActorRoundAttack[];
  attacks: ActionAttack[];
  onTarget: (attackName: string, targetId: string) => void;
  onBo: (attackName: string, bo: number) => void;
  onRange: (attackName: string, range: number | null) => void;
  onProtector: (attackName: string, actorId: string) => void;
  onProtectorPosition: (attackName: string, actorId: string, position: ProtectPosition) => void;
  /** The fixed OB of a reaction (Riposte, workspace spec 076): shown instead of the weapon's, and not editable. */
  fixedOb?: number | null;
  /** Shown below the attacks: the OB split of a bolt with several targets (workspace spec 077). */
  footer?: ReactNode;
}> = ({
  kind,
  actorRound,
  sourceAttacks,
  attacks,
  onTarget,
  onBo,
  onRange,
  onProtector,
  onProtectorPosition,
  fixedOb,
  footer,
}) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const toOption = useActorRoundOption();
  // Penalties apply to the roll (the API adds them), not to the OB to spend.
  const penalty = (actorRound.penalty?.modifiers ?? []).reduce((sum, m) => sum + m.value, 0);

  if (attacks.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t(kind === 'melee' ? 'no-melee-attacks' : 'no-ranged-attacks')}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {/* Two weapons side by side on wide screens. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: attacks.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr' },
          gap: 2,
        }}
      >
        {attacks.map((attack) => {
          const weapon = sourceAttacks.find((a) => a.attackName === attack.attackName);
          const targetId = attack.modifiers.targetId;
          const protectorCandidates = (actorRounds ?? []).filter(
            (ar) =>
              ar.actorId !== actorRound.actorId && ar.actorId !== targetId && ar.factionId !== actorRound.factionId
          );
          return (
            <Panel
              key={attack.attackName}
              variant="outlined"
              title={attackLabel(attack.attackName, t)}
              // An attack is chosen by giving it a target: the same highlight as a selected tile, which is not clickable
              sx={
                targetId
                  ? (theme) => ({ borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.12) })
                  : undefined
              }
            >
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {[
                      weapon && `${attackLabel(weapon.attackTable, t)} ${formatBonus(fixedOb ?? weapon.currentBo)}`,
                      penalty !== 0 && t('penalties-on-roll', { value: penalty }),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                  {weapon && (
                    <AttackSizeVsTarget
                      attackSize={weapon.attackSize ?? 0}
                      target={targetId ? actorRounds?.find((ar) => ar.actorId === targetId) : undefined}
                    />
                  )}
                </Box>
                <TargetPicker
                  sourceActorRound={actorRound}
                  value={targetId}
                  onChange={(id) => onTarget(attack.attackName, id)}
                />
                {targetId && (
                  <>
                    {fixedOb !== null && fixedOb !== undefined ? (
                      <Typography variant="body2">{t('reaction-ob-override', { ob: formatBonus(fixedOb) })}</Typography>
                    ) : (
                      <Box sx={{ maxWidth: 200 }}>
                        <NumberPadField
                          steps={[-10, -5, 5, 10]}
                          label={t('used-ob')}
                          value={attack.modifiers.bo}
                          onChange={(bo) => onBo(attack.attackName, bo ?? 0)}
                          min={0}
                          max={weapon?.currentBo ?? 0}
                          integer
                          allowNegatives={false}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {t('parry-max', { max: weapon?.currentBo ?? 0 })}
                        </Typography>
                      </Box>
                    )}
                    {kind === 'ranged' && weapon && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
                          {t('range')}
                        </Typography>
                        <SelectAttackRange
                          attack={weapon}
                          value={attack.modifiers.range ?? null}
                          onChange={(range) => onRange(attack.attackName, range)}
                        />
                      </Box>
                    )}
                    {kind === 'melee' && protectorCandidates.length > 0 && (
                      <Box>
                        <CharacterPicker
                          mode="multiple"
                          variant="compact"
                          label={t('protectors')}
                          options={protectorCandidates.map((ar) =>
                            toOption(ar, { secondary: `${t('protect')} ${ar.defense?.protect ?? 0}` })
                          )}
                          value={attack.protectors ?? []}
                          onChange={(ids) => {
                            const current = attack.protectors ?? [];
                            [
                              ...ids.filter((id) => !current.includes(id)),
                              ...current.filter((id) => !ids.includes(id)),
                            ].forEach((id) => onProtector(attack.attackName, id));
                          }}
                        />
                        {(attack.protectors ?? []).map((protectorId) => (
                          <Stack
                            key={protectorId}
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center', mt: 1, maxWidth: 420 }}
                          >
                            <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                              {actorRounds?.find((ar) => ar.actorId === protectorId)?.actorName ?? protectorId}
                            </Typography>
                            <TextField
                              select
                              size="small"
                              label={t('protect-position')}
                              value={attack.protectorPositions?.[protectorId] ?? 'other'}
                              onChange={(e) =>
                                onProtectorPosition(attack.attackName, protectorId, e.target.value as ProtectPosition)
                              }
                              sx={{ minWidth: 220 }}
                            >
                              {PROTECT_POSITIONS.map((position) => (
                                <MenuItem key={position} value={position}>
                                  {t(`protect-position-${position}`)}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Stack>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </Stack>
            </Panel>
          );
        })}
      </Box>
      {footer}
    </Stack>
  );
};

export default AttackTargetsStep;
