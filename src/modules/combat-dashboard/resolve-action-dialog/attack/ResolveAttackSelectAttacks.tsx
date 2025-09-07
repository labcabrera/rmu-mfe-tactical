import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclarationItemDto, AttackDeclarationDto } from '../../../api/actions';
import type { Character, CharacterAttack } from '../../../api/characters';
import SelectAttackTarget from '../../../shared/selects/SelectAttackTarget';

const ResolveAttackSelectAttacks: React.FC<{
  formData: AttackDeclarationDto;
  setFormData: (data: AttackDeclarationDto) => void;
  character: Character;
}> = ({ formData, setFormData, character }) => {
  const { characters } = useContext(CombatContext) as { characters: Character[] };

  return <AttackList character={character} characters={characters} formData={formData} setFormData={setFormData} />;
};

export default ResolveAttackSelectAttacks;

type AttackListProps = {
  formData: AttackDeclarationDto;
  setFormData: (data: AttackDeclarationDto) => void;
  character: Character;
  characters: Character[];
};

const AttackList: FC<AttackListProps> = ({ formData, setFormData, character, characters }) => {
  const { t } = useTranslation();
  const selected = formData.attacks || [];

  const findAttack = (attackName: string) => selected.find((a) => a.attackName === attackName);

  const handleToggle = (attackName: string) => {
    const exists = findAttack(attackName);
    let newSelected: AttackDeclarationItemDto[];
    if (exists) {
      newSelected = selected.filter((a) => a.attackName !== attackName);
    } else {
      newSelected = [
        ...selected,
        {
          attackName,
          targetId: '',
          bo: 0,
          cover: 'none',
          restrictedQuarters: 'none',
          positionalSource: 'none',
          positionalTarget: 'none',
          dodge: 'none',
          range: '0',
          customBonus: '0',
          disabledDB: false,
          disabledShield: false,
          disabledParry: false,
        },
      ];
    }
    setFormData({ ...formData, attacks: newSelected });
  };

  const handleTargetChange = (attackName: string, targetId: string) => {
    const newSelected = selected.map((a) => (a.attackName === attackName ? { ...a, targetId } : a));
    setFormData({ ...formData, attacks: newSelected });
  };

  if (!character?.attacks || character.attacks.length === 0) {
    return <Typography>No attacks available</Typography>;
  }

  return (
    <>
      {character.attacks.map((attack: CharacterAttack) => (
        <Grid container key={attack.attackName} spacing={2} alignItems="center" style={{ marginBottom: 8 }}>
          <Grid size={1}>
            <Checkbox checked={!!findAttack(attack.attackName)} onChange={() => handleToggle(attack.attackName)} />
          </Grid>
          <Grid size={2}>
            <Typography variant="body2">{t(attack.attackName)}</Typography>
          </Grid>
          <Grid size={2}>
            <Typography variant="body2">
              {t(attack.attackTable)}: {attack.bo}
            </Typography>
          </Grid>
          {!!findAttack(attack.attackName) && (
            <Grid size={2}>
              <SelectAttackTarget
                value={findAttack(attack.attackName)?.targetId || ''}
                onChange={(value: string) => handleTargetChange(attack.attackName, value)}
                includeSource={true}
                sourceId={character.id}
                targets={characters}
                i18nLabel="target-attack"
              />
            </Grid>
          )}
        </Grid>
      ))}
    </>
  );
};
