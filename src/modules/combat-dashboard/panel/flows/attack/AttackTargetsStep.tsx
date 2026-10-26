import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardContent, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { formatBonus, NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { ActionAttack, PROTECT_POSITIONS, ProtectPosition } from '../../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../../api/actor-rounds.dto';
import SelectAttackRange from '../../../../shared/selects/SelectAttackRange';
import TargetPicker from './TargetPicker';
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
  attackLabel: (attackName: string) => string;
  onTarget: (attackName: string, targetId: string) => void;
  onBo: (attackName: string, bo: number) => void;
  onRange: (attackName: string, range: number | null) => void;
  onProtector: (attackName: string, actorId: string) => void;
  onProtectorPosition: (attackName: string, actorId: string, position: ProtectPosition) => void;
}> = ({
  kind,
  actorRound,
  sourceAttacks,
  attacks,
  attackLabel,
  onTarget,
  onBo,
  onRange,
  onProtector,
  onProtectorPosition,
}) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
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
    // Two weapons side by side on wide screens.
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
          (ar) => ar.actorId !== actorRound.actorId && ar.actorId !== targetId && ar.factionId !== actorRound.factionId
        );
        return (
          <Card key={attack.attackName}>
            <CardContent>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {attackLabel(attack.attackName)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[
                      weapon && `${t(weapon.attackTable)} ${formatBonus(weapon.currentBo)}`,
                      penalty !== 0 && t('penalties-on-roll', { value: penalty }),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                </Box>
                <TargetPicker
                  sourceActorRound={actorRound}
                  value={targetId}
                  onChange={(id) => onTarget(attack.attackName, id)}
                />
                {targetId && (
                  <>
                    <Box sx={{ maxWidth: 200 }}>
                      <NumericInput
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
                        <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
                          {t('protectors')}
                        </Typography>
                        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                          {protectorCandidates.map((ar) => {
                            const on = (attack.protectors ?? []).includes(ar.actorId);
                            return (
                              <Chip
                                key={ar.actorId}
                                label={`${ar.actorName} · ${t('protect')} ${ar.defense?.protect ?? 0}`}
                                color={on ? 'primary' : 'default'}
                                variant={on ? 'filled' : 'outlined'}
                                aria-pressed={on}
                                onClick={() => onProtector(attack.attackName, ar.actorId)}
                              />
                            );
                          })}
                        </Stack>
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
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default AttackTargetsStep;
