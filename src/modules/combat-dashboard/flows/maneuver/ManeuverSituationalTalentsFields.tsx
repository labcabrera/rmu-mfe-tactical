import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ChipRow, formatBonus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ManeuverModifiersListing } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { ManeuverForm, smellsTarget } from './maneuver-form';

/**
 * Situational talents of the actor for the skill rolled (workspace spec 079, D3): a checkbox for each one the game
 * master ticks when the situation applies (calming by voice, reading emotions, an animal of its type...), the automatic
 * ones as chips, and the actor perceived or tracked by smell, whose Neutral or Distinct Odor the API reads.
 */
const ManeuverSituationalTalentsFields: FC<{
  listing: ManeuverModifiersListing;
  form: ManeuverForm;
  onChange: (change: Partial<ManeuverForm>) => void;
  targets: ActorRound[];
}> = ({ listing, form, onChange, targets }) => {
  const { t } = useTranslation();
  const options = listing.situationalTraits ?? [];
  const ticked = options.filter((option) => option.mode === 'ticked');
  const automatic = options.filter((option) => option.mode === 'automatic');
  const smell = smellsTarget(listing, form);
  if (options.length === 0 && !smell) return null;
  const toggle = (traitId: string) =>
    onChange({
      situationalTraits: form.situationalTraits.includes(traitId)
        ? form.situationalTraits.filter((each) => each !== traitId)
        : [...form.situationalTraits, traitId],
    });
  return (
    <Stack spacing={1}>
      {options.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" component="div">
            {t('situational-talents')}
          </Typography>
          {ticked.length > 0 && (
            <FormGroup>
              {ticked.map((option) => (
                <FormControlLabel
                  key={option.traitId}
                  control={
                    <Checkbox
                      size="small"
                      checked={form.situationalTraits.includes(option.traitId)}
                      onChange={() => toggle(option.traitId)}
                    />
                  }
                  label={`${t(option.traitId)} ${formatBonus(option.value)} · ${t(`situational-trait-${option.condition}`)}`}
                />
              ))}
            </FormGroup>
          )}
          {automatic.length > 0 && (
            <ChipRow>
              {automatic.map((option) => (
                <Chip
                  key={option.traitId}
                  size="small"
                  variant="outlined"
                  color="success"
                  label={`${t(option.traitId)} ${formatBonus(option.value)}`}
                />
              ))}
            </ChipRow>
          )}
        </Box>
      )}
      {smell && (
        <TextField
          select
          size="small"
          label={t('sense-target-actor')}
          helperText={t('sense-target-actor-help')}
          value={form.senseTargetActorId ?? ''}
          onChange={(event) => onChange({ senseTargetActorId: event.target.value || null })}
          sx={{ maxWidth: 320 }}
        >
          <MenuItem value="">{t('none')}</MenuItem>
          {targets.map((target) => (
            <MenuItem key={target.actorId} value={target.actorId}>
              {target.actorName}
            </MenuItem>
          ))}
        </TextField>
      )}
    </Stack>
  );
};

export default ManeuverSituationalTalentsFields;
