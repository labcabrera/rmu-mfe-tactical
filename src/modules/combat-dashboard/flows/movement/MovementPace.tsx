import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, ButtonBase, Chip, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { ChipRow, selectableSx } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionMovement, MOVEMENT_TABLE } from '../../../api/action.dto';
import { NORMAL_PACES } from '../../../services/movement-service';
import {
  backwardsChange,
  freePaceOption,
  MovementPlan,
  normalPaceCaption,
  oneDecimal,
  PaceCaption,
} from './movement-rules';

/** Keeps the height of the caption of a pace without a penalty. */
const NBSP = ' ';

type Modifiers = ActionMovement['modifiers'];

type PaceProps = {
  plan: MovementPlan;
  modifiers: Modifiers;
  scale: number;
  onChange: (change: Partial<Modifiers>) => void;
};

/** A pace to choose: its name and multiplier, why it cannot be taken or what it costs, and the distance it covers. */
const PaceOption: FC<{
  name: string;
  hint: string;
  caption: PaceCaption;
  feet: number;
  scale: number;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}> = ({ name, hint, caption, feet, scale, selected, disabled, onSelect }) => {
  const { t } = useTranslation();
  let text: string = NBSP;
  if (caption) text = 'text' in caption ? caption.text : t(caption.key, caption.pace ? { pace: t(caption.pace) } : {});
  return (
    <ButtonBase
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      sx={[
        selectableSx(selected, disabled),
        { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', textAlign: 'left', px: 1.5, py: 1 },
      ]}
    >
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {name}{' '}
          <Typography component="span" variant="caption" color="text.secondary">
            {hint}
          </Typography>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {text}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {oneDecimal(feet)}&apos;
        </Typography>
        {scale !== 1 && (
          <Typography variant="caption" color="text.secondary">
            {oneDecimal(feet * scale)}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  );
};

/** What changes the BMR or stops the movement, and the switch to go backwards. */
const PaceNotes: FC<Pick<PaceProps, 'plan' | 'modifiers' | 'onChange'>> = ({ plan, modifiers, onChange }) => {
  const { t } = useTranslation();
  return (
    <>
      {plan.bmrReasons.length > 0 && (
        <ChipRow>
          {plan.bmrReasons.map((reason) => (
            <Chip
              key={reason}
              size="small"
              variant="outlined"
              color="info"
              label={`${t(`bmr-multiplier-${reason}`)}: ${t('bmr')} ×½`}
            />
          ))}
        </ChipRow>
      )}
      <FormControlLabel
        control={
          <Switch
            checked={plan.backwards}
            onChange={(e) => onChange(backwardsChange(modifiers.pace, e.target.checked))}
          />
        }
        label={t('movement-backwards')}
      />
      {plan.prone && (
        <Alert severity="info" variant="outlined">
          {t('movement-prone-note')}
        </Alert>
      )}
      {!plan.freeMovement && plan.twoFoci && (
        <Alert severity="warning" variant="outlined">
          {t('err-action-double-concentration')}
        </Alert>
      )}
      {plan.nothingLeft && (
        <Alert severity="warning" variant="outlined">
          {t('movement-nothing-left')}
        </Alert>
      )}
    </>
  );
};

/** A normal movement: what it comes to, the paces it can choose, and the dash. */
export const NormalPace: FC<PaceProps> = ({ plan, modifiers, scale, onChange }) => {
  const { t } = useTranslation();
  const { actionPoints, chosenPace, dashing, dashBlocked, left, normalDistance } = plan;
  return (
    <Stack spacing={1.5}>
      <PaceNotes plan={plan} modifiers={modifiers} onChange={onChange} />
      <ChipRow>
        <Chip size="small" variant="outlined" label={`${t('movement-ap')}: ${actionPoints}`} />
        <Chip
          size="small"
          variant="outlined"
          label={`${t('distance')}: ${oneDecimal(normalDistance)}'${
            scale !== 1 ? ` (${oneDecimal(normalDistance * scale)})` : ''
          }`}
        />
        {chosenPace && (
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={`${t('movement-round-pace')}: ${t(chosenPace)}`}
          />
        )}
        {plan.talliedFatigue && (
          <Chip size="small" variant="outlined" label={`${t('fatigue')}: +${oneDecimal(plan.addedFatigue)}`} />
        )}
        <Chip size="small" variant="outlined" label={`${t('movement-left')}: ${oneDecimal(left)}'`} />
      </ChipRow>
      {!dashing && (
        <Stack spacing={0.75} role="radiogroup" aria-label={t('pace')}>
          <Typography variant="caption" color="text.secondary">
            {t('movement-pace-help')}
          </Typography>
          {NORMAL_PACES.map((row) => (
            <PaceOption
              key={row.id}
              name={t(row.id)}
              hint={`×${row.perRound}`}
              caption={normalPaceCaption(plan, row.id)}
              feet={plan.normalPaceDistance(row.id)}
              scale={scale}
              selected={chosenPace === row.id}
              disabled={plan.normalPaceDisabled(row.id)}
              onSelect={() => onChange({ pace: row.id })}
            />
          ))}
        </Stack>
      )}
      <Box>
        <FormControlLabel
          control={
            <Switch
              checked={dashing}
              disabled={!!dashBlocked && !dashing}
              onChange={(e) => onChange({ pace: e.target.checked ? 'dash' : '' })}
            />
          }
          label={t('movement-dash')}
        />
        <Typography variant="caption" color="text.secondary" component="div">
          {dashBlocked ? t(dashBlocked) : t('movement-dash-help')}
        </Typography>
      </Box>
    </Stack>
  );
};

/** A free movement: the paces of the table, up to the one a free movement allows. */
export const FreePace: FC<PaceProps> = ({ plan, modifiers, scale, onChange }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={0.75} role="radiogroup" aria-label={t('pace')}>
      <PaceNotes plan={plan} modifiers={modifiers} onChange={onChange} />
      {MOVEMENT_TABLE.map((row, index) => {
        const { disabled, caption } = freePaceOption(plan, row, index);
        return (
          <PaceOption
            key={row.id}
            name={t(row.id)}
            hint={row.label}
            caption={caption}
            feet={plan.distance(row.multiplier)}
            scale={scale}
            selected={modifiers.pace === row.id}
            disabled={disabled}
            onSelect={() => onChange({ pace: row.id })}
          />
        );
      })}
    </Stack>
  );
};
