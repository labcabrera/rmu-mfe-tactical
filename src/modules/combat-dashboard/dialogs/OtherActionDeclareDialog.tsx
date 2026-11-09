import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material';
import {
  CreateActionOtherFields,
  HEAVY_CROSSBOW_LOAD_AP,
  OTHER_ACTION_AP,
  OTHER_ACTION_KINDS,
  OTHER_ACTION_WEAPON_KINDS,
  OtherActionKind,
  RmuDialog,
  RuleHint,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../api/actor-rounds.dto';
import { attackLabel } from '../../services/attack-label';

/** No subtype: the plain `other` action of 1 to 4 AP, as before workspace spec 079. */
const GENERIC = '';

/**
 * Declaration of an `other` action (workspace spec 079, A5): a subtype with the fixed AP of Table 8-1, or none for a
 * free-form one. Stringing a bow names its attack (optional); loading a crossbow needs it, and the API tells a heavy
 * crossbow (14 AP) from its attack, item type or item name.
 */
const OtherActionDeclareDialog: FC<{
  open: boolean;
  actorRound: ActorRound | null;
  busy: boolean;
  onClose: () => void;
  onDeclare: (fields: CreateActionOtherFields) => void;
}> = ({ open, actorRound, busy, onClose, onDeclare }) => {
  const { t } = useTranslation();
  const [kind, setKind] = useState<OtherActionKind | typeof GENERIC>(GENERIC);
  const [attackName, setAttackName] = useState('');

  useEffect(() => {
    if (!open) return;
    setKind(GENERIC);
    setAttackName('');
  }, [open]);

  if (!actorRound) return null;

  const crossbow = kind === 'load-crossbow';
  const withWeapon = kind !== GENERIC && OTHER_ACTION_WEAPON_KINDS.includes(kind);
  const attacks = (actorRound.attacks ?? []).filter(
    (attack) =>
      attack.type === 'ranged' &&
      (crossbow ? attack.attackTable?.includes('crossbow') : !attack.attackTable?.includes('crossbow'))
  );
  const ready = kind === GENERIC || !crossbow || !!attackName;
  const apLabel = (each: OtherActionKind) =>
    each === 'load-crossbow'
      ? t('other-action-ap-crossbow', { light: OTHER_ACTION_AP[each], heavy: HEAVY_CROSSBOW_LOAD_AP })
      : t('other-action-ap', { ap: OTHER_ACTION_AP[each] });

  const declare = () =>
    onDeclare(kind === GENERIC ? {} : { otherAction: { kind, ...(withWeapon && attackName ? { attackName } : {}) } });

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      title={t('other')}
      subtitle={actorRound.actorName}
      maxWidth="sm"
      buttons={
        <>
          <Button onClick={onClose} disabled={busy}>
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={declare} disabled={busy || !ready}>
            {t('declare')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <RuleHint title={t('other-action-kind')} description={t('other-action-help')} reference="Table 8-1">
          <Alert severity="info" variant="outlined">
            {t('other-action-intro')}
          </Alert>
        </RuleHint>
        <TextField
          select
          size="small"
          label={t('other-action-kind')}
          value={kind}
          onChange={(event) => {
            setKind(event.target.value as OtherActionKind | typeof GENERIC);
            setAttackName('');
          }}
        >
          <MenuItem value={GENERIC}>{t('other-action-generic')}</MenuItem>
          {OTHER_ACTION_KINDS.map((each) => (
            <MenuItem key={each} value={each}>
              {`${t(`other-action-${each}`)} · ${apLabel(each)}`}
            </MenuItem>
          ))}
        </TextField>
        {withWeapon && (
          <TextField
            select
            size="small"
            label={t('weapon')}
            value={attackName}
            onChange={(event) => setAttackName(event.target.value)}
            error={crossbow && !attackName}
            helperText={crossbow && attacks.length === 0 ? t('other-action-no-crossbow') : undefined}
          >
            {!crossbow && <MenuItem value="">{t('other-action-no-weapon')}</MenuItem>}
            {attacks.map((attack) => (
              <MenuItem key={attack.attackName} value={attack.attackName}>
                {attackLabel(attack.attackName, t)}
              </MenuItem>
            ))}
          </TextField>
        )}
        {kind !== GENERIC && OTHER_ACTION_AP[kind] > 4 && (
          <Alert severity="info" variant="outlined">
            {t('other-action-multi-round')}
          </Alert>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default OtherActionDeclareDialog;
