import React, { FC, useContext, useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  IconButton,
  Stack,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Tooltip,
  DialogTitle,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { CombatContext } from '../../../../CombatContext';
import { ActorRound } from '../../../api/actor-rounds.dto';
import ActorRoundAvatar from '../../../shared/avatars/ActorRoundAvatar';

const avatarSize = 100;

const TargetSelector: FC<{
  value?: string | null; // actorRound id
  onChange: (actorRoundId: string | null) => void;
  sourceId?: string | null; // character id of source
}> = ({ value = null, onChange, sourceId = null }) => {
  const { actorRounds } = useContext(CombatContext)!;
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'distinct' | 'all'>('distinct');

  const targets = useMemo(() => {
    if (!actorRounds || !sourceId) return [] as ActorRound[];
    if (filter === 'all') return actorRounds;
    const sourceActorRound = actorRounds.find((e) => e.actorId === sourceId)!;
    const sourceFactionId = sourceActorRound.factionId;
    return actorRounds.filter((c) => c.factionId !== sourceFactionId);
  }, [actorRounds, filter, sourceId]);

  const selectedActorRound = useMemo(() => {
    if (!value || !actorRounds) return null;
    return (actorRounds || []).find((ar) => ar.actorId === value) || null;
  }, [value, actorRounds]);

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title={selectedActorRound ? selectedActorRound.actorName : 'No target selected'}>
          <IconButton onClick={() => setOpen((s) => !s)} sx={{ p: 0 }}>
            <ActorRoundAvatar
              actorRound={selectedActorRound || undefined}
              size={avatarSize}
              variant="square"
              dead={false}
            />
          </IconButton>
        </Tooltip>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" noWrap>
            {selectedActorRound ? selectedActorRound.actorName : 'Select target'}
          </Typography>
        </Box>
        <IconButton onClick={() => setOpen((s) => !s)} aria-label="expand">
          <ExpandMoreIcon sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
        </IconButton>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth transitionDuration={0}>
        <DialogTitle>Select target</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
            <RadioGroup row value={filter} onChange={(e) => setFilter(e.target.value as any)}>
              <FormControlLabel
                value="distinct"
                control={<Radio disabled={!actorRounds} />}
                label={<Typography variant="caption">Distinct faction</Typography>}
              />
              <FormControlLabel
                value="all"
                control={<Radio disabled={!actorRounds} />}
                label={<Typography variant="caption">All</Typography>}
              />
            </RadioGroup>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
            {(targets || []).map((ar) => {
              const actorRound = (actorRounds || []).find((c) => c.actorId === ar.actorId) || null;
              const isSelected = value === ar.actorId;
              return (
                <Box key={ar.id} sx={{ textAlign: 'center', mb: 0.5 }}>
                  <Button
                    onClick={() => {
                      onChange(ar.actorId);
                      setOpen(false);
                    }}
                    variant={isSelected ? 'contained' : 'outlined'}
                    size="medium"
                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, alignItems: 'center', p: 0.5 }}
                  >
                    <ActorRoundAvatar actorRound={actorRound || undefined} size={avatarSize} variant="square" />
                    <Typography variant="caption" noWrap sx={{ maxWidth: 60 }}>
                      {actorRound ? actorRound.actorName : ar.actorName}
                    </Typography>
                  </Button>
                </Box>
              );
            })}
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TargetSelector;
