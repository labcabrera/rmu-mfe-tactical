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
import CharacterAvatar from '../../../shared/avatars/CharacterAvatar';

type Props = {
  value?: string | null;
  onChange: (actorId: string | null) => void;
  sourceId?: string | null;
};

const TargetSelector: FC<Props> = ({ value = null, onChange, sourceId = null }) => {
  const { actorRounds, characters } = useContext(CombatContext)!;
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'distinct' | 'all'>('distinct');

  const items = useMemo(() => {
    if (!actorRounds) return [] as any[];
    let list = actorRounds;
    if (filter === 'distinct' && characters && sourceId) {
      const sourceChar = (characters || []).find((c) => c.id === (sourceId as string)) as any;
      const sourceFaction = sourceChar?.factionId;
      if (sourceFaction) {
        list = list.filter((ar) => {
          const ch = (characters || []).find((c) => c.id === ar.actorId) as any;
          return ch && ch.factionId !== sourceFaction;
        });
      }
    }
    return list;
  }, [actorRounds, characters, filter, sourceId]);

  const selectedCharacter = useMemo(() => {
    if (!value || !characters) return null;
    return characters.find((c) => c.id === value) || null;
  }, [value, characters]);

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title={selectedCharacter ? selectedCharacter.name : 'No target selected'}>
          <IconButton onClick={() => setOpen((s) => !s)} sx={{ p: 0 }}>
            <CharacterAvatar
              character={(selectedCharacter as any) || ({ id: '', info: {} } as any)}
              size={48}
              variant="square"
              dead={false}
            />
          </IconButton>
        </Tooltip>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" noWrap>
            {selectedCharacter ? selectedCharacter.name : 'Select target'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {selectedCharacter ? selectedCharacter.info?.raceName : ''}
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
              const ch = (characters || []).find((c) => c.id === ar.actorId);
              if (!ch) return null;
              const isSelected = value === ch.id;
              return (
                <Box key={ar.id} sx={{ textAlign: 'center', width: 64, mb: 0.5 }}>
                  <Button
                    onClick={() => {
                      onChange(ch.id);
                      setOpen(false);
                    }}
                    variant={isSelected ? 'contained' : 'outlined'}
                    size="medium"
                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, alignItems: 'center', p: 0.5 }}
                  >
                    <CharacterAvatar
                      character={ch as any}
                      size={40}
                      variant="square"
                      dead={ar.effects?.some((e: any) => e.status === 'dead')}
                    />
                    <Typography variant="caption" noWrap sx={{ maxWidth: 60 }}>
                      {ch.name}
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
