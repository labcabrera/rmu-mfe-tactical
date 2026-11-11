/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Autocomplete, TextField } from '@mui/material';
import {
  AntidoteFields,
  AntidoteFieldsValue,
  antidoteDto,
  EMPTY_ANTIDOTE_FIELDS,
  GiveAntidoteDto,
  Injury,
  Item,
  RmuDialog,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { giveActorAntidote } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatActions } from '../../combat/combat-context';
import { useCatalogCategory } from './usePoisonCatalog';

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
  const notify = useApiNotify();
  const { updateActorRound } = useCombatActions();
  const herbs = useCatalogCategory('herb', !!injury).filter((item) => item.features?.antidote);
  const [fields, setFields] = useState<AntidoteFieldsValue>(EMPTY_ANTIDOTE_FIELDS);
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    if (!injury) return;
    setFields(EMPTY_ANTIDOTE_FIELDS);
    setItem(null);
  }, [injury?.id]);

  const dto = (): GiveAntidoteDto | undefined => {
    const antidote = item?.features?.antidote;
    return antidoteDto(
      fields,
      item && antidote ? { source: 'item', name: item.name, itemTypeId: item.id, ...antidote } : undefined
    );
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
      <AntidoteFields
        numberPad
        value={fields}
        onChange={(patch) => setFields((current) => ({ ...current, ...patch }))}
        itemField={
          <Autocomplete
            size="small"
            options={herbs}
            value={item}
            getOptionLabel={(option) => t(option.name, option.name)}
            isOptionEqualToValue={(option, other) => option.id === other.id}
            onChange={(_, value) => setItem(value)}
            renderInput={(params) => <TextField {...params} label={t('antidote')} />}
          />
        }
      />
    </RmuDialog>
  );
};

export default ActorAntidoteDialog;
