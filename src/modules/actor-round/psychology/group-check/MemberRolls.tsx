import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';
import { formatBonus, NumberPadField, OPEN_D100, RollField } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { fearBonus } from '../ResistanceRollDialog';
import { GroupCheckForm } from './group-check';

/**
 * Rolls and RR bonuses of each member, optional: the API rolls the missing ones and reads the bonus from the sheet
 * (an NPC needs its bonus, or it is left out of the check).
 */
const MemberRolls: FC<{
  form: GroupCheckForm;
  members: ActorRound[];
  leaderId: string | null;
  onChange: (patch: Partial<GroupCheckForm>) => void;
  disabled: boolean;
}> = ({ form, members, leaderId, onChange, disabled }) => {
  const { t } = useTranslation();
  const followers = members.filter((member) => member.actorId !== leaderId || form.kind === 'fear');
  const missingNpcBonus = followers.filter(
    (member) => fearBonus(member) === undefined && (form.bonuses[member.actorId] ?? null) === null
  ).length;
  return (
    <Accordion disableGutters variant="outlined">
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack>
          <Typography variant="body2">{t('member-rolls')}</Typography>
          {missingNpcBonus > 0 && (
            <Typography variant="caption" color="warning.main">
              {t('member-rolls-missing-bonus', { count: missingNpcBonus })}
            </Typography>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          {followers.map((member) => {
            const sheet = fearBonus(member);
            return (
              <Stack
                key={member.actorId}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ alignItems: { sm: 'center' } }}
              >
                <Box sx={{ minWidth: 160 }}>
                  <Typography variant="body2">{member.actorName}</Typography>
                </Box>
                {form.kind === 'fear' && (
                  <RollField
                    spec={OPEN_D100}
                    label={t('roll')}
                    value={form.rolls[member.actorId] ?? null}
                    onChange={(value) => onChange({ rolls: { ...form.rolls, [member.actorId]: value.total } })}
                    onClear={() => onChange({ rolls: { ...form.rolls, [member.actorId]: null } })}
                    placeholder={t('roll-by-server')}
                    disabled={disabled}
                  />
                )}
                <NumberPadField
                  steps={[-10, -5, 5, 10]}
                  label={t('fear-rr-bonus')}
                  value={form.bonuses[member.actorId] ?? null}
                  onChange={(value) => onChange({ bonuses: { ...form.bonuses, [member.actorId]: value } })}
                  placeholder={sheet !== undefined ? formatBonus(sheet) : undefined}
                  error={sheet === undefined && (form.bonuses[member.actorId] ?? null) === null}
                  integer
                  allowNegatives
                  disabled={disabled}
                />
              </Stack>
            );
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default MemberRolls;
