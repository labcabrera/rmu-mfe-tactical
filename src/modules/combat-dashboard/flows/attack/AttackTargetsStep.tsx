import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Box, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { CharacterPicker, formatBonus, NumberPadField, obMargin, Panel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action, ActionAttack, PROTECT_POSITIONS, ProtectPosition } from '../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../api/actor-rounds.dto';
import { useCombatRound } from '../../../combat/combat-context';
import { useActorRoundOption } from '../../../hooks/useActorRoundOption';
import { usableAttacks } from '../../../services/actor-round-service';
import { isActionClosed } from '../../../services/ap-service';
import { attackLabel } from '../../../services/attack-label';
import SelectAttackRange from '../../../shared/selects/SelectAttackRange';
import AttackSizeVsTarget from './AttackSizeVsTarget';
import ObBudgetBar from './ObBudgetBar';
import TargetPicker from './TargetPicker';
import { AttackKind } from './useAttackDeclaration';

/** Another actor's open attack aimed at the actor: it may still need a parry this round. */
const threatens = (action: Action, actorId: string) =>
  action.actorId !== actorId &&
  !isActionClosed(action) &&
  (action.attacks ?? []).some((attack) => attack.modifiers?.targetId === actorId);

/**
 * First step of an attack: for each weapon, its target (inline), the OB it uses, and its protectors (melee), each
 * with where it stands (Table 9-7c), or its range (ranged). Weapons without a target are not declared.
 *
 * Workspace spec 085, 2.1-2.2: with several weapons each one is optional and can go back to no target; a weapon
 * without OB this round is a dimmed line; the OB of each attack shows how it splits, and what the round leaves to
 * parry, in amber when it is nothing and enemies still attack the actor.
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
  /** The attack spends the OB of the round (workspace spec 082): not a spell, a reaction or a stray shot. */
  spendsRoundOb?: boolean;
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
  spendsRoundOb = false,
  footer,
}) => {
  const { t } = useTranslation();
  const { actorRounds, roundActions } = useCombatRound();
  const toOption = useActorRoundOption();
  // Penalties apply to the roll (the API adds them), not to the OB to spend.
  const penalty = (actorRound.penalty?.modifiers ?? []).reduce((sum, m) => sum + m.value, 0);

  // Workspace spec 082: what the action will leave to every attack of the actor, and so to parry
  const margin = spendsRoundOb
    ? obMargin(
        usableAttacks(actorRound),
        attacks
          .filter((attack) => !!attack.modifiers.targetId)
          .map((attack) => ({ attackName: attack.attackName, bo: attack.modifiers.bo ?? 0 }))
      )
    : null;

  const threatened = (roundActions ?? []).some((action) => threatens(action, actorRound.actorId));
  const weaponOf = (attack: ActionAttack) => sourceAttacks.find((a) => a.attackName === attack.attackName);
  const withoutOb = (attack: ActionAttack) => {
    const weapon = weaponOf(attack);
    return spendsRoundOb && !!weapon && weapon.currentBo <= 0;
  };
  const usable = attacks.filter((attack) => !withoutOb(attack));
  const spent = attacks.filter(withoutOb);
  const optional = usable.length > 1;
  // The reserve is the same for the whole action: it goes with the first attack that has a target.
  const reserveOwner = usable.find((attack) => !!attack.modifiers.targetId)?.attackName;

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
          gridTemplateColumns: { xs: '1fr', lg: usable.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr' },
          gap: 2,
        }}
      >
        {usable.map((attack) => {
          const weapon = weaponOf(attack);
          const targetId = attack.modifiers.targetId;
          const protectorCandidates = (actorRounds ?? []).filter(
            (ar) =>
              ar.actorId !== actorRound.actorId && ar.actorId !== targetId && ar.factionId !== actorRound.factionId
          );
          return (
            <Panel
              key={attack.attackName}
              variant="outlined"
              title={[
                attackLabel(attack.attackName, t),
                weapon && `${attackLabel(weapon.attackTable, t)} ${formatBonus(fixedOb ?? weapon.currentBo)}`,
              ]
                .filter(Boolean)
                .join(' · ')}
              extra={
                optional ? (
                  targetId ? (
                    <Button size="small" onClick={() => onTarget(attack.attackName, '')}>
                      {t('no-target')}
                    </Button>
                  ) : (
                    <Chip size="small" variant="outlined" label={t('optional')} />
                  )
                ) : undefined
              }
              // An attack is chosen by giving it a target: the same highlight as a selected tile, which is not clickable
              sx={
                targetId
                  ? (theme) => ({ borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.12) })
                  : undefined
              }
            >
              <Stack spacing={1.5}>
                <Box>
                  {penalty !== 0 && (
                    <Typography variant="caption" color="text.secondary" component="div">
                      {t('penalties-on-roll', { value: penalty })}
                    </Typography>
                  )}
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
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
                        <Box sx={{ width: 200, flexShrink: 0 }}>
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
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <ObBudgetBar
                            used={attack.modifiers.bo ?? 0}
                            max={weapon?.currentBo ?? 0}
                            reserve={attack.attackName === reserveOwner ? margin : null}
                            threatened={threatened}
                            onChange={(bo) => onBo(attack.attackName, bo)}
                          />
                        </Box>
                      </Stack>
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
      {spent.map((attack) => {
        const weapon = weaponOf(attack);
        return (
          <Typography key={attack.attackName} variant="body2" color="text.disabled">
            {[
              attackLabel(attack.attackName, t),
              weapon && `${attackLabel(weapon.attackTable, t)} ${formatBonus(weapon.currentBo)}`,
              t('attack-no-ob-left'),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        );
      })}
      {footer}
    </Stack>
  );
};

export default AttackTargetsStep;
