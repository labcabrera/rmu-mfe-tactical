import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack, ActionAttackModifiers, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import type { Character } from '../../../api/characters';
import OffensiveBonusSelector from './OffensiveBonusSelector';
import TargetSelector from './TargetSelector';

const MeleeAttackSelectAttacks: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  actorRound: ActorRound;
  character: Character;
}> = ({ formData, setFormData, actorRound, character }) => {
  const { characters } = useContext(CombatContext) as { characters: Character[] };

  return (
    <AttackList
      actorRound={actorRound}
      character={character}
      characters={characters}
      formData={formData}
      setFormData={setFormData}
    />
  );
};

export default MeleeAttackSelectAttacks;

const AttackList: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  actorRound: ActorRound;
  character: Character;
  characters: Character[];
}> = ({ formData, setFormData, actorRound }) => {
  const selected = formData.attacks || [];

  const findAttack = (attackName: string) => selected.find((a) => a.modifiers.attackName === attackName);

  const handleTargetChange = (attackName: string, targetId: string | null) => {
    const exists = findAttack(attackName);
    let newSelected: ActionAttack[];
    if (exists) {
      newSelected = selected.map((a) =>
        a.modifiers.attackName === attackName ? { ...a, modifiers: { ...a.modifiers, targetId } } : a
      );
    } else {
      const baseBo = actorRound.attacks.find((a) => a.attackName === attackName)?.currentBo || 0;
      const modifiers = { attackName, targetId, bo: baseBo } as ActionAttackModifiers;
      newSelected = [...selected, { modifiers, calculated: undefined, roll: undefined, results: undefined }];
    }
    setFormData({ ...formData, attacks: newSelected });
  };

  const handleBoChange = (attackName: string, bo: number) => {
    const exists = findAttack(attackName);
    let newSelected: ActionAttack[];
    if (exists) {
      newSelected = selected.map((a) =>
        a.modifiers.attackName === attackName ? { ...a, modifiers: { ...a.modifiers, bo } } : a
      );
    } else {
      const modifiers = { attackName, targetId: null, bo } as ActionAttackModifiers;
      newSelected = [...selected, { modifiers, calculated: undefined, roll: undefined, results: undefined }];
    }
    setFormData({ ...formData, attacks: newSelected });
  };

  if (!actorRound || !actorRound.attacks) {
    return <Typography>No attacks available</Typography>;
  }

  return (
    <>
      {actorRound.attacks.map((attack, index) => {
        const existing = findAttack(attack.attackName);
        const modifiers =
          existing?.modifiers ??
          ({
            attackName: attack.attackName,
            targetId: null,
            bo: attack.currentBo || 0,
          } as ActionAttackModifiers);

        return (
          <>
            <Typography variant="h6">{t(attack.attackName)}</Typography>
            <Grid container key={index} spacing={1} alignItems="center">
              <Grid size={2}>
                {t(attack.attackTable)} +{attack.currentBo}
              </Grid>
              <Grid size={4}>
                <OffensiveBonusSelector
                  value={modifiers.bo}
                  max={attack.currentBo}
                  onChange={(bo: number) => handleBoChange(attack.attackName, bo)}
                />
              </Grid>
              <Grid size={6}>
                <TargetSelector
                  value={modifiers.targetId || ''}
                  onChange={(actorId) => handleTargetChange(attack.attackName, actorId)}
                  sourceId={(actorRound as any).actorId}
                />
              </Grid>
            </Grid>
          </>
        );
      })}
    </>
  );
};
