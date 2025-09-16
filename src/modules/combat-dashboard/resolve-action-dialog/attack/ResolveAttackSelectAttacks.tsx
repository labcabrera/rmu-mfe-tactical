import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Grid, Typography } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import type { Character } from '../../../api/characters';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectAttackTarget from '../../../shared/selects/SelectAttackTarget';

const ResolveAttackSelectAttacks: React.FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  actorRound: ActorRound;
  character: Character;
}> = ({ formData, setFormData, actorRound, character }) => {
  const { characters } = useContext(CombatContext) as { characters: Character[] };

  return <AttackList actorRound={actorRound} character={character} characters={characters} formData={formData} setFormData={setFormData} />;
};

export default ResolveAttackSelectAttacks;

const AttackList: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  actorRound: ActorRound;
  character: Character;
  characters: Character[];
}> = ({ formData, setFormData, actorRound, character, characters }) => {
  const { t } = useTranslation();
  const selected = formData.attacks || [];

  const findAttack = (attackName: string) => selected.find((a) => a.modifiers.attackName === attackName);

  const handleToggle = (attackName: string) => {
    const exists = findAttack(attackName);
    let newSelected: ActionAttack[];
    if (exists) {
      newSelected = selected.filter((a) => a.modifiers.attackName !== attackName);
    } else {
      newSelected = [
        ...selected,
        {
          modifiers: {
            attackName,
            targetId: null,
            bo: actorRound.attacks.find((a) => a.attackName === attackName)?.currentBo || 0,
            calledShot: 'none',
            cover: 'none',
            restrictedQuarters: 'none',
            positionalSource: 'none',
            positionalTarget: 'none',
            calledShot: undefined,
            calledShotPenalty: undefined,
            dodge: 'none',
            range: null,
            customBonus: 0,
            disabledDB: false,
            disabledShield: false,
            disabledParry: false,
          },
          calculated: undefined,
        },
      ];
    }
    setFormData({ ...formData, attacks: newSelected });
  };

  const handleTargetChange = (attackName: string, targetId: string) => {
    const newSelected = selected.map((a) => (a.modifiers.attackName === attackName ? { ...a, modifiers: { ...a.modifiers, targetId } } : a));
    setFormData({ ...formData, attacks: newSelected });
  };

  const handleBoChange = (attackName, bo: number) => {
    const newSelected = selected.map((a) => (a.modifiers.attackName === attackName ? { ...a, modifiers: { ...a.modifiers, bo } } : a));
    setFormData({ ...formData, attacks: newSelected });
  };

  if (!actorRound || !actorRound.attacks) {
    return <Typography>No attacks available</Typography>;
  }

  return (
    <>
      {actorRound.attacks.map((attack, index) => (
        <Grid container key={index} spacing={2} alignItems="center" style={{ marginBottom: 8 }}>
          <Grid size={1}>
            <Checkbox checked={!!findAttack(attack.attackName)} onChange={() => handleToggle(attack.attackName)} />
          </Grid>
          <Grid size={2}>
            <Typography variant="body2">{t(attack.attackName)}</Typography>
          </Grid>
          <Grid size={2}>
            <Typography variant="body2">
              {t(attack.attackTable)}: {attack.currentBo}
            </Typography>
          </Grid>
          {!!findAttack(attack.attackName) && attack.currentBo > 0 && (
            <>
              <Grid size={2}>
                <SelectAttackTarget
                  value={findAttack(attack.attackName)?.modifiers.targetId || ''}
                  onChange={(value: string) => handleTargetChange(attack.attackName, value)}
                  includeSource={true}
                  sourceId={character.id}
                  targets={characters}
                  i18nLabel="target-attack"
                />
              </Grid>
              <Grid size={2}>
                <NumericInput
                  label={t('attack-used-bo')}
                  name={`${attack.attackName}.bo`}
                  value={attack.currentBo}
                  min={1}
                  max={attack.currentBo}
                  onChange={(bo) => {
                    handleBoChange(attack.attackName, bo);
                  }}
                  integer
                  allowNegatives={false}
                />
              </Grid>
            </>
          )}
        </Grid>
      ))}
    </>
  );
};
