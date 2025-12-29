import React, { FC, useContext } from 'react';
import { Chip, Grid } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack } from '../../../api/action.dto';
import KeyValueModifiersView from '../../../shared/generic/KeyValueModifiersView';
import AttackTitle from './AttackTitle';

const ResolveAttackFormModifiers: FC<{
  attack: ActionAttack;
}> = ({ attack }) => {
  const { actorRounds } = useContext(CombatContext);

  if (!attack || !attack.calculated) return <div>Loading...</div>;

  const target = actorRounds.find((a) => a.actorId === attack.modifiers?.targetId);

  const getModifierColor = (value: number) => {
    if (value > 0) return 'success';
    if (value < 0) return 'error';
    return undefined;
  };

  return (
    <Grid container spacing={1} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={12}>
        <AttackTitle attack={attack} target={target} />
      </Grid>
      <Grid size={2}>
        <Chip
          label={`${t('total-modifiers')}: ${attack.calculated.rollTotal}`}
          color={getModifierColor(attack.calculated.rollTotal)}
        />
      </Grid>
      <Grid size={10}>
        <KeyValueModifiersView modifiers={attack.calculated.rollModifiers} />
      </Grid>
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
