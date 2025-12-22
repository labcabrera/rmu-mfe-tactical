import React, { FC, useContext, useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, IconButton, Collapse, Stack, Typography, Select, MenuItem, Button, Tooltip } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import CharacterAvatar from '../../../shared/avatars/CharacterAvatar';

type Props = {
  value?: string | null;
  onChange: (actorId: string | null) => void;
  includeSelf?: boolean;
};

const TargetSelector: FC<Props> = ({ value = null, onChange, includeSelf = true }) => {
  const { actorRounds, characters, factions } = useContext(CombatContext)!;
  const [open, setOpen] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState<string | 'all'>('all');

  const items = useMemo(() => {
    if (!actorRounds) return [] as any[];
    let list = actorRounds;
    if (selectedFaction !== 'all' && characters) {
      list = list.filter((ar) => {
        const ch = (characters || []).find((c) => c.id === ar.actorId);
        return ch && ch.factionId === selectedFaction;
      });
    }
    return list;
  }, [actorRounds, characters, selectedFaction]);

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
        <Box sx={{ mt: 1, p: 1, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption">Faction:</Typography>
            <Select
              size="small"
              value={selectedFaction}
              onChange={(e) => setSelectedFaction(e.target.value as any)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">All</MenuItem>
              {(factions || []).map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name}
                </MenuItem>
              ))}
            </Select>
            <Button size="small" onClick={() => setSelectedFaction('all')}>
              Clear
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {(items || []).map((ar) => {
              const ch = (characters || []).find((c) => c.id === ar.actorId);
              if (!ch) return null;
              const isSelected = value === ch.id;
              return (
                <Box key={ar.id} sx={{ textAlign: 'center', width: 88, mb: 1 }}>
                  <Button
                    onClick={() => {
                      onChange(ch.id);
                      setOpen(false);
                    }}
                    variant={isSelected ? 'contained' : 'outlined'}
                    size="small"
                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center', p: 1 }}
                  >
                    <CharacterAvatar
                      character={ch as any}
                      size={40}
                      variant="square"
                      dead={ar.effects?.some((e: any) => e.status === 'dead')}
                    />
                    <Typography variant="caption" noWrap sx={{ maxWidth: 72 }}>
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
