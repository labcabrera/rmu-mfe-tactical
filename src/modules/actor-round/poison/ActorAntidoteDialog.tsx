/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Autocomplete, Grid, MenuItem, Stack, TextField } from '@mui/material';
import {
  ANY_POISON,
  AntidoteSource,
  GiveAntidoteDto,
  Injury,
  Item,
  NumericInput,
  POISON_CATEGORIES,
  RmuDialog,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { giveActorAntidote } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';
import { useCatalogCategory } from './use-poison-catalog';

const SOURCES: AntidoteSource[] = ['item', 'magic', 'external'];

/**
 * Gives an antidote for a poisoning in the game (spec 042): an antidote of the catalog, a spell, or one described by
 * hand. Tactical games do not track the doses: the strategic inventory keeps them.
 */
const ActorAntidoteDialog: FC<{ actorRound: ActorRound; injury: Injury | null; onClose: () => void }> = ({
  actorRound,
  injury,
  onClose,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { updateActorRound } = useContext(CombatContext)!;
  const herbs = useCatalogCategory('herb', !!injury).filter((item) => item.features?.antidote);
  const [source, setSource] = useState<AntidoteSource>('item');
  const [item, setItem] = useState<Item | null>(null);
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => {
    if (!injury) return;
    setSource('item');
    setItem(null);
    setName('');
    setCategories([]);
    setLevel(null);
  }, [injury?.id]);

  const dto = (): GiveAntidoteDto | undefined => {
    if (source === 'item') {
      const antidote = item?.features?.antidote;
      return item && antidote ? { source, name: item.name, itemTypeId: item.id, ...antidote } : undefined;
    }
    if (!name.trim()) return undefined;
    if (source === 'magic') return { source, name, level: level ?? undefined };
    if (categories.length === 0 || level === null) return undefined;
    return { source, name, categories, level };
  };

  const save = () => {
    const body = dto();
    if (!injury || !body) return;
    giveActorAntidote(actorRound.id, injury.id, body, auth)
      .then((result) => {
        updateActorRound(result.actorRound);
        if (result.neutralized) notify.success(t('antidote-neutralized'));
        else notify.warning(t('antidote-not-neutralized'));
        onClose();
      })
      .catch(notify.error);
  };

  return (
    <RmuDialog
      open={!!injury}
      title={t('give-antidote')}
      subtitle={`${actorRound.actorName} · ${injury?.poison?.name ?? ''}`}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={save}
      onConfirmDisabled={!dto()}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField
          select
          size="small"
          label={t('antidote-source')}
          value={source}
          onChange={(e) => setSource(e.target.value as AntidoteSource)}
        >
          {SOURCES.map((each) => (
            <MenuItem key={each} value={each}>
              {t(`antidote-source-${each}`)}
            </MenuItem>
          ))}
        </TextField>
        {source === 'item' && (
          <Autocomplete
            size="small"
            options={herbs}
            value={item}
            getOptionLabel={(option) => t(option.name, option.name)}
            isOptionEqualToValue={(option, other) => option.id === other.id}
            onChange={(_, value) => setItem(value)}
            renderInput={(params) => <TextField {...params} label={t('antidote')} />}
          />
        )}
        {source !== 'item' && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                size="small"
                fullWidth
                label={t('name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <NumericInput
                integer
                min={0}
                allowNegatives={false}
                label={t('level')}
                value={level}
                onChange={setLevel}
              />
            </Grid>
            {source === 'external' && (
              <Grid size={12}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  label={t('poison-categories')}
                  value={categories}
                  slotProps={{ select: { multiple: true } }}
                  onChange={(e) => setCategories(e.target.value as unknown as string[])}
                >
                  {[...POISON_CATEGORIES, ANY_POISON].map((category) => (
                    <MenuItem key={category} value={category}>
                      {t(`poison-category-${category}`)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default ActorAntidoteDialog;
