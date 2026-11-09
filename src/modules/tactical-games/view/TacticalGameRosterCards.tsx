import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CasinoIcon from '@mui/icons-material/Casino';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ShieldIcon from '@mui/icons-material/Shield';
import { Avatar, Box, CardActionArea, Stack, SxProps, Theme, Tooltip, Typography } from '@mui/material';
import { Character, entityImage, Faction, LoadingState, selectableSx } from '@labcabrera-rmu/rmu-react-shared-lib';

export function SelectionMetric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{
        alignItems: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: (theme) => `${theme.radius.sm}px`,
        px: 1.5,
        py: 1,
        minWidth: 180,
      }}
    >
      {icon}
      <Box>
        <Typography variant="h6" sx={{ lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Stack>
  );
}

/** Check over the corner: filled when selected, empty when not, a spinner while saving. */
function SelectionMark({ selected, pending }: { selected: boolean; pending: boolean }) {
  if (pending) return <LoadingState variant="inline" />;
  return selected ? (
    <CheckCircleIcon color="primary" sx={{ bgcolor: 'background.paper', borderRadius: '50%' }} />
  ) : (
    <RadioButtonUncheckedIcon sx={{ color: 'text.disabled' }} />
  );
}

/** Image of an element: in colour when selected, faded when not. */
const imageSx = (selected: boolean): SxProps<Theme> => ({
  filter: selected ? 'none' : 'grayscale(0.85)',
  opacity: selected ? 1 : 0.5,
  transition: 'opacity 120ms, filter 120ms',
});

export function FactionRow({
  faction,
  count,
  selected,
  disabled,
  dimmed,
  pending,
  hint,
  onClick,
}: {
  faction: Faction;
  count: string;
  selected: boolean;
  disabled: boolean;
  dimmed: boolean;
  pending: boolean;
  hint?: string;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const card = (
    <Box sx={[selectableSx(selected, dimmed), { height: '100%', overflow: 'hidden' }]}>
      <CardActionArea
        role="checkbox"
        aria-checked={selected}
        disabled={disabled}
        onClick={onClick}
        sx={{ height: '100%' }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 1 }}>
          <Avatar
            variant="rounded"
            src={entityImage('faction', faction.imageUrl)}
            alt={faction.name}
            sx={{ width: 40, height: 40, ...imageSx(selected) }}
          />
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap color={selected ? 'text.primary' : 'text.secondary'}>
              {faction.name}
            </Typography>
            <Tooltip title={t('characters')}>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: 'center', color: 'text.secondary', width: 'fit-content' }}
              >
                <PersonIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">{count}</Typography>
              </Stack>
            </Tooltip>
          </Box>
          {dimmed ? (
            <LockIcon fontSize="small" sx={{ color: 'text.disabled' }} />
          ) : (
            <SelectionMark selected={selected} pending={pending} />
          )}
        </Stack>
      </CardActionArea>
    </Box>
  );
  return hint ? (
    <Tooltip title={hint}>
      <Box sx={{ height: '100%' }}>{card}</Box>
    </Tooltip>
  ) : (
    card
  );
}

/** Initiative, DB and hit points of a character, on the right of its card. */
export function CharacterStats({ character }: { character: Character }) {
  const { t } = useTranslation();
  return (
    <Stack spacing={0.5} sx={{ alignSelf: 'center' }}>
      <IconStat
        icon={<CasinoIcon fontSize="inherit" />}
        value={character.initiative.totalBonus}
        label={t('initiative')}
      />
      <IconStat
        icon={<ShieldIcon fontSize="inherit" />}
        value={character.defense.defensiveBonus}
        label={t('defensive-bonus')}
      />
      <IconStat icon={<HeartBrokenIcon fontSize="inherit" />} value={character.hp.current} label={t('hit-points')} />
    </Stack>
  );
}

function IconStat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <Tooltip title={label}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
        {icon}
        <Typography variant="caption">{value}</Typography>
      </Stack>
    </Tooltip>
  );
}
