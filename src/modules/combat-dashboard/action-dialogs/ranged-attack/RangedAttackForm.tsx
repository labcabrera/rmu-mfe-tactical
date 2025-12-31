import React, { FC, useEffect } from 'react';
import { Chip, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { Action, ActionAttack, ActionAttackModifiers, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import KeyValueModifiersView from '../../../shared/generic/KeyValueModifiersView';
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

  useEffect(() => {
    if (actorRound && formData) {
      formData.attacks?.forEach((attack) => {
        const matchingAttack = actorRound.attacks?.find((a) => a.attackName === attack.attackName);
        if (!matchingAttack) {
          const newAttacks = formData.attacks?.filter((a) => a.attackName !== attack.attackName) || [];
          setFormData({ ...formData, attacks: newAttacks });
        }
      });
    }
  }, [actorRound, formData]);

  if (!actorRound || (!actorRound.attacks && !action.attacks)) {
    return <Typography>No ranged attacks available</Typography>;
  }

  return (
    <>
      {(action.attacks || []).map((actionAttack, index) => {
        const actorAttack = actorRound.attacks?.find((a) => a.attackName === actionAttack.attackName);
        const existing = findAttack(actionAttack.attackName);
        const modifiers =
          existing?.modifiers ??
          actionAttack.modifiers ??
          ({ targetId: null, bo: actorAttack?.currentBo || 0 } as ActionAttackModifiers);

        const displayTable = actorAttack?.attackTable || '';
        const displayBo = actorAttack?.currentBo ?? actionAttack.modifiers?.bo ?? 0;

        return (
          <div key={index}>
            <Typography variant="h6">{t(actionAttack.attackName)}</Typography>
            <Grid container spacing={1} alignItems="center">
              <Grid size={2}>
                {t(displayTable)} +{displayBo}
              </Grid>
              <Grid size={10}>
                <TargetSelector
                  value={modifiers.targetId || ''}
                  onChange={(actorId) => handleTargetChange(actionAttack.attackName, actorId)}
                  sourceId={(actorRound as any).actorId}
                />
              </Grid>
            </Grid>

            {existing && actorAttack && (
              <>
                <RangedAttackModifiersForm
                  action={action}
                  attack={actorAttack}
                  formData={formData}
                  setFormData={setFormData}
                  index={selected.findIndex((a) => a.attackName === actionAttack.attackName)}
                />
                {actionAttack.calculated && (
                  <>
                    <Typography>Calculated</Typography>
                    <Grid container spacing={1}>
                      <Grid size={3}>
                        <Chip label={`Total: ${actionAttack.calculated.rollTotal}`} />
                      </Grid>
                      <Grid size={9}>
                        <KeyValueModifiersView modifiers={actionAttack.calculated.rollModifiers} />
                      </Grid>
                    </Grid>
                  </>
                )}
              </>
            )}
          </div>
        );
      })}
      <pre>Ranged FormData: {JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default RangedAttackForm;
