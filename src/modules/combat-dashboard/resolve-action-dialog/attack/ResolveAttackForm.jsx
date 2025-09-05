/* eslint-disable react/prop-types */
import React, { useContext, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { CombatContext } from '../../../../CombatContext';
import SelectAttackTarget from '../../../shared/selects/SelectAttackTarget';

const AttackList = ({ formData, setFormData, character, characters }) => {
  const selected = formData.attacks || [];

  const handleToggle = (attackId) => {
    console.log('Toggling attack:', attackId);
    const newSelected = selected.includes(attackId) ? selected.filter((id) => id !== attackId) : [...selected, attackId];
    setFormData({ ...formData, attacks: newSelected });
  };

  const handleTargetChange = (value) => {
    //setFormData({ ...formData, targetId: value });
  };

  if (!character?.attacks || character.attacks.length === 0) {
    return <Typography>No attacks available</Typography>;
  }

  return (
    <>
      {character.attacks.map((attack) => (
        <Grid container key={attack.attackName} spacing={2} alignItems="center" style={{ marginBottom: 8 }}>
          <Grid size={2}>
            <Checkbox checked={selected.includes(attack.id)} onChange={() => handleToggle(attack.id)} />
          </Grid>
          <Grid size={2}>
            <Typography variant="body2">{attack.attackName}</Typography>
          </Grid>
          <Grid size={2}>
            <SelectAttackTarget
              value={formData.targetId}
              onChange={handleTargetChange}
              includeSource={false}
              source={character.id}
              targets={characters}
            />
          </Grid>
        </Grid>

        //   </Grid>
        //   <ListItem key={attack.attackName} divider>
        //     <ListItemText
        //       primary={<Typography variant="subtitle1">{attack.attackName}</Typography>}
        //       secondary={
        //         <>
        //           <Typography variant="body2">BO: {attack.bo}</Typography>
        //           <Typography variant="body2">Table: {attack.attackTable}</Typography>
        //         </>
        //       }
        //     />
        //     <ListItemText
        //       primary={<Typography variant="subtitle1">{attack.attackName}</Typography>}
        //       secondary={
        //         <>
        //           <Typography variant="body2">BO: {attack.bo}</Typography>
        //           <Typography variant="body2">Table: {attack.attackTable}</Typography>
        //         </>
        //       }
        //     />
        //     <AttackList character={character} formData={formData} setFormData={setFormData} />
        //   </ListItem>
      ))}
    </>
  );
};

const ResolveAttackForm = ({ formData, setFormData, character, game, strategicGame, action }) => {
  const { actorRounds, characters } = useContext(CombatContext);

  return (
    <>
      <Grid container spacing={2}>
        todo: select attacks to resolve
      </Grid>
      <AttackList character={character} characters={characters} formData={formData} setFormData={setFormData} />
    </>
  );
};

export default ResolveAttackForm;
