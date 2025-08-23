import React from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import SelectAttackPosition from '../../shared/selects/SelectAttackPosition';
import SelectCover from '../../shared/selects/SelectCover';

const AttackResolutionAttributes = ({ attackKey, formData, setFormData, character }) => {
  const handleTargetChange = (targetCharacterId) => {
    const targetCharacter = characters.find((e) => e.id == targetCharacterId);
    setTargetCharacter(targetCharacter);
    setFormData((prevState) => ({
      ...prevState,
      tacticalCharacterTargetId: targetCharacterId,
      transient: {
        ...prevState.transient,
        armorType: targetCharacter.defense.armorType,
        defenderSizeId: targetCharacter.info.sizeId,
        defensiveBonus: targetCharacter.defense.defensiveBonus,
      },
    }));
  };

  const handleSelectCoverChange = (e) => {
    setFormData((prevState) => ({
      ...formData,
      attackInfo: {
        ...formData.attackInfo,
        attacks: {
          ...formData.attackInfo.attacks,
          [attackKey]: {
            ...formData.attackInfo.attacks[attackKey],
            cover: e,
          },
        },
      },
    }));
  };

  const handleSelectAttackPositionChange = (e) => {
    setFormData((prevState) => ({
      ...formData,
      attackInfo: {
        ...formData.attackInfo,
        attacks: {
          ...formData.attackInfo.attacks,
          [attackKey]: {
            ...formData.attackInfo.attacks[attackKey],
            position: e,
          },
        },
      },
    }));
  };

  const updateFormData = (field1, field2, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field1]: {
        ...prevState[field1],
        [field2]: value,
      },
    }));
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SelectCover value={formData.attackInfo.attacks[attackKey].cover} onChange={handleSelectCoverChange} />
        </Grid>
        <Grid item xs={12}>
          <SelectAttackPosition value={formData.attackInfo.attacks[attackKey].position} onChange={handleSelectAttackPositionChange} />
        </Grid>
        <Grid item xs={4}>
          <List>
            <ListItem key={-1}>
              <Typography variant="body">Attacker modifiers: {formData.attacks[attackKey].totalAttackerBonus}</Typography>
            </ListItem>
            {formData.attacks[attackKey].attackerBonusModifiers.map((key, index) => (
              <ListItem key={index}>
                <Typography variant="caption">
                  {key.type}: {key.value}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={4}>
          <List>
            <ListItem key={-1}>
              <Typography variant="body">Defender modifiers: {formData.attacks[attackKey].totalDefenderBonus}</Typography>
            </ListItem>
            {formData.attacks[attackKey].defenderBonusModifiers.map((key, index) => (
              <ListItem key={index}>
                <Typography variant="caption">
                  {key.type}: {key.value}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={4}>
          <List>
            <ListItem key={-1}>
              <Typography variant="body">Attack modifiers {formData.attacks[attackKey].totalAttackBonus}</Typography>
            </ListItem>
            {formData.attacks[attackKey].attackBonusModifiers.map((key, index) => (
              <ListItem key={index}>
                <Typography variant="caption">
                  {key.type}: {key.value}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body">Total modifiers: {formData.attacks[attackKey].totalBonus}</Typography>
        </Grid>
      </Grid>
      {/* <pre>
                {JSON.stringify(formData.attacks[attackKey], null, 2)}
            </pre> */}
    </>
  );
};

export default AttackResolutionAttributes;
