import React, { FC, useEffect, useState } from 'react';
import { Chip, Grid, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { Action, ActionManeuver } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import useSkillService from '../../../services/skillService';
import KeyValueModifiersView from '../../../shared/generic/KeyValueModifiersView';
import ActionManeuverModifiersForm from './ActionManeuverModifiersForm';

const ActionManeuverForm: FC<{
  action: Action;
  actorRound: ActorRound;
}> = ({ action, actorRound }) => {
  const [formData, setFormData] = useState<ActionManeuver>(null);

  const isSuccess = (): boolean => {
    return !action.maneuver.result.result.includes('failure');
  };

  const { getSkillBonus } = useSkillService();
  const skillId = action.maneuver?.modifiers?.skillId;
  const skillBonusNumber = skillId ? getSkillBonus(skillId, actorRound) : undefined;

  const getSkillBonusLabel = () => {
    if (skillBonusNumber === undefined) return ' +0';
    return skillBonusNumber >= 0 ? ` +${skillBonusNumber}` : ` ${skillBonusNumber}`;
  };

  useEffect(() => {
    if (action.maneuver) {
      setFormData(action.maneuver);
    }
  }, [action]);

  if (!formData) return <div>Loading...</div>;

  return (
    <>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={12}>
          <Stack direction="row" spacing={1} mb={2}>
            <Chip label={`${t(action.maneuver?.modifiers?.skillId)}${getSkillBonusLabel()}`} color="info" />
            <Chip label={t(action.maneuver?.modifiers?.maneuverType)} color="info" />
            {action.freeAction && <Chip label={t('free-action')} color="info" />}
          </Stack>
        </Grid>
        <Grid size={12}>
          <ActionManeuverModifiersForm action={action} formData={formData} setFormData={setFormData} />
        </Grid>
        {action.status === 'completed' && (
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            <Chip label={t(action.maneuver.result.result)} color={isSuccess() ? 'success' : 'error'} />
            <Typography variant="body1" gutterBottom mt={1}>
              {action.maneuver.result.message}
            </Typography>
            <Chip label={`Action Points: ${action.actionPoints}`} />
            <Typography variant="h6" gutterBottom>
              Modifiers
            </Typography>
            <Stack direction="row" spacing={1} mt={1} mb={1}>
              <Chip label={`Total: ${action.maneuver.roll.totalRoll}`} />
            </Stack>
            <KeyValueModifiersView modifiers={action.maneuver?.roll?.modifiers} />
          </Grid>
        )}
      </Grid>
      {/* <pre>formData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>action: {JSON.stringify(action, null, 2)}</pre> */}
    </>
  );
};

export default ActionManeuverForm;
