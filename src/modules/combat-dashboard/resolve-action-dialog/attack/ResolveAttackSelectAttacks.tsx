import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclarationItemDto, AttackDeclarationDto } from '../../../api/actions';
import { ActorRound } from '../../../api/actor-rounds';
import type { Character } from '../../../api/characters';
import NumericTextField from '../../../shared/inputs/NumericTextField_excluded.tsx';
import SelectAttackTarget from '../../../shared/selects/SelectAttackTarget';

const ResolveAttackSelectAttacks: React.FC<{
  formData: AttackDeclarationDto;
  setFormData: (data: AttackDeclarationDto) => void;
  actorRound: ActorRound;
  character: Character;
}> = ({ formData, setFormData, actorRound, character }) => {
  const { characters } = useContext(CombatContext) as { characters: Character[] };

  return <AttackList actorRound={actorRound} character={character} characters={characters} formData={formData} setFormData={setFormData} />;
};

export default ResolveAttackSelectAttacks;

const AttackList: FC<{
  formData: AttackDeclarationDto;
  setFormData: (data: AttackDeclarationDto) => void;
  actorRound: ActorRound;
  character: Character;
  characters: Character[];
}> = ({ formData, setFormData, actorRound, character, characters }) => {
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

  const handleBoChange = (attackName: string) => (e) => {
    const newSelected = selected.map((a) => (a.attackName === attackName ? { ...a, bo: e.target.value } : a));
    setFormData({ ...formData, attacks: newSelected });
  };

  if (!actorRound || !actorRound.attacks) {
    return <Typography>No attacks available</Typography>;
  }

  return (
    <>
      {actorRound.attacks.map((attack) => (
        <Grid container key={attack.attackName} spacing={2} alignItems="center" style={{ marginBottom: 8 }}>
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
                  value={findAttack(attack.attackName)?.targetId || ''}
                  onChange={(value: string) => handleTargetChange(attack.attackName, value)}
                  includeSource={true}
                  sourceId={character.id}
                  targets={characters}
                  i18nLabel="target-attack"
                />
              </Grid>
              <Grid size={2}>
                <NumericTextField label={t('bo')} value={attack.currentBo} onChange={handleBoChange} />
              </Grid>
              <Grid size={2}>
                <Slider defaultValue={attack.currentBo} aria-label="Default" valueLabelDisplay="auto" max={attack.currentBo} />
              </Grid>
            </>
          )}
        </Grid>
      ))}
    </>
  );
};
