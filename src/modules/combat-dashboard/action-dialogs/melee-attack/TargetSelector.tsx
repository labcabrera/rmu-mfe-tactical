import React, { FC, useContext, useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  IconButton,
  Collapse,
  Stack,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Tooltip,
} from '@mui/material';
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

  const items = useMemo(() => {
    if (!actorRounds) return [] as ActorRound[];
    let list = actorRounds;
    if (filter === 'distinct' && actorRounds && sourceId) {
      const sourceChar = (actorRounds || []).find((c) => c.id === (sourceId as string)) as any;
      const sourceFaction = sourceChar?.factionId;
      if (sourceFaction) {
        list = list.filter((ar) => {
          const ch = (actorRounds || []).find((c) => c.id === ar.actorId) as any;
          return ch && ch.factionId !== sourceFaction;
        });
      }
    }
    return list;
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

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box
          sx={{
            mt: 1,
            p: 0.5,
            border: '1px solid primary.main',
            borderRadius: 1,
            backgroundColor: '#484c4d',
          }}
        >
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
            {(items || []).map((ar) => {
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
        </Box>
      </Collapse>
    </Box>
  );
};

export default TargetSelector;
