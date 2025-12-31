import React, { FC, useEffect } from 'react';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { Action, ActionAttack, ActionAttackModifiers, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import TargetSelector from '../melee-attack/TargetSelector';
import RangedAttackModifiersForm from './RangedAttackModifiersForm';

const RangedAttackForm: FC<{
  actorRound: ActorRound;
  action: Action;
}> = ({ actorRound, action }) => {
  const [formData, setFormData] = React.useState<AttackDeclaration>({ attacks: [], parries: [] });

  const selected = formData.attacks || [];

  const findAttack = (attackName: string) => selected.find((a) => a.attackName === attackName);

  const handleTargetChange = (attackName: string, targetId: string | null) => {
    const exists = findAttack(attackName);
    let newSelected: ActionAttack[];
    if (exists) {
      newSelected = selected.map((a) =>
        a.attackName === attackName ? { ...a, modifiers: { ...a.modifiers, targetId } } : a
      );
    } else {
      const baseBo = (actorRound.attacks || []).find((a: any) => a.attackName === attackName)?.currentBo || 0;
      const modifiers = { targetId, bo: baseBo } as ActionAttackModifiers;
      newSelected = [
        ...selected,
        {
          attackName: attackName,
          modifiers,
          calculated: undefined,
          roll: undefined,
          results: undefined,
        },
      ];
    }
    setFormData({ ...formData, attacks: newSelected });
  };

  useEffect(() => {
    if (action.attacks) {
      setFormData(action as AttackDeclaration);
    }
  }, [action]);

  if (!actorRound || !actorRound.attacks) {
    return <Typography>No ranged attacks available</Typography>;
  }

  return (
    <>
      {actorRound.attacks.map((attack, index) => {
        const existing = findAttack(attack.attackName);
        const modifiers =
          existing?.modifiers ?? ({ targetId: null, bo: attack.currentBo || 0 } as ActionAttackModifiers);

        return (
          <div key={index}>
            <Typography variant="h6">{t(attack.attackName)}</Typography>
            <Grid container spacing={1} alignItems="center">
              <Grid size={2}>
                {t(attack.attackTable)} +{attack.currentBo}
              </Grid>
              <Grid size={10}>
                <TargetSelector
                  value={modifiers.targetId || ''}
                  onChange={(actorId) => handleTargetChange(attack.attackName, actorId)}
                  sourceId={(actorRound as any).actorId}
                />
              </Grid>
            </Grid>

            {findAttack(attack.attackName) && (
              <div style={{ marginTop: 8 }}>
                <RangedAttackModifiersForm
                  attack={attack}
                  formData={formData}
                  setFormData={setFormData}
                  index={selected.findIndex((a) => a.attackName === attack.attackName)}
                />
              </div>
            )}
          </div>
        );
      })}
      <pre>Ranged FormData: {JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default RangedAttackForm;
