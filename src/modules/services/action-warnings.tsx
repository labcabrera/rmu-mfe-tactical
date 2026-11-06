import React, { ReactNode, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';
import { ConfirmDialog, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TFunction } from 'i18next';
import { CombatContext } from '../../CombatContext';
import { ACTION_CONFIRM_REQUIRED, ActionWarning } from '../api/action.dto';
import type { ActorRound } from '../api/actor-rounds.dto';
import { apiErrorCode, apiErrorDetails, ConfirmCancelledError } from './notify-service';

// Warnings of the declaration and resolution of actions (workspace spec 068): the ones that need a confirmation come
// in a 409 `err-action-confirm-required` with `details.warnings`, and the request is sent again with `confirm: true`;
// the others come in the `warnings` of the answer and are only shown.

/** The warnings of a 409 `err-action-confirm-required`, or undefined for any other error. */
export const confirmWarnings = (error: unknown): ActionWarning[] | undefined => {
  if (apiErrorCode(error) !== ACTION_CONFIRM_REQUIRED) return undefined;
  const warnings = apiErrorDetails(error)?.warnings;
  return Array.isArray(warnings) ? (warnings as ActionWarning[]) : [];
};

const injuryLabel = (injuryId: unknown, actorRounds: ActorRound[] | null, t: TFunction): string => {
  const injury = (actorRounds ?? []).flatMap((each) => each.injuries ?? []).find((each) => each.id === injuryId);
  if (!injury) return t('injury');
  return [t(`injury-type-${injury.type ?? 'unknown'}`), injury.location ? t(injury.location) : null]
    .filter(Boolean)
    .join(' · ');
};

/** The text of a warning, its ids and keys turned into names (patient, procedure, injury, pace, fear state). */
export const warningText = (warning: ActionWarning, t: TFunction, actorRounds: ActorRound[] | null): string => {
  const params = warning.params ?? {};
  const patient = (actorRounds ?? []).find((each) => each.actorId === params.patientActorId)?.actorName;
  return t(`action-warning-${warning.code}`, {
    ...params,
    patient: patient ?? '',
    procedure: params.procedure ? t(`procedure-${params.procedure}`) : '',
    injury: injuryLabel(params.injuryId, actorRounds, t),
    location: params.location ? t(String(params.location)) : '',
    side: params.side ? t(`side-${String(params.side)}`) : '',
    pace: params.pace ? t(String(params.pace)) : '',
    state: params.state ? t(String(params.state)) : '',
    defaultValue: String(warning.code),
  });
};

/** Shows the informational warnings of an answer (fear pace, a useless limb...) as one notification. */
export const useNotifyWarnings = () => {
  const { t } = useTranslation();
  const notify = useNotify();
  const combat = useContext(CombatContext);
  return (warnings: ActionWarning[] | undefined) => {
    const shown = (warnings ?? []).filter((warning) => !warning.requiresConfirm);
    if (shown.length > 0) notify.warning(shown.map((w) => warningText(w, t, combat?.actorRounds ?? null)).join(' · '));
  };
};

type PendingConfirm = { warnings: ActionWarning[]; confirm: () => void; cancel: () => void };

/**
 * Sends a request that may need a confirmation: `run(send)` calls `send(false)` and, on a 409
 * `err-action-confirm-required`, lists its warnings in a dialog; confirming sends `send(true)`. Declining rejects with
 * a `ConfirmCancelledError`, which the tactical notifications ignore. Render `dialog` next to the caller.
 */
export const useActionConfirm = (): {
  run: <T>(send: (confirm: boolean) => Promise<T>) => Promise<T>;
  dialog: ReactNode;
} => {
  const { t } = useTranslation();
  const combat = useContext(CombatContext);
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const run = <T,>(send: (confirm: boolean) => Promise<T>): Promise<T> =>
    send(false).catch((error) => {
      const warnings = confirmWarnings(error);
      if (!warnings) throw error;
      return new Promise<T>((resolve, reject) =>
        setPending({
          warnings,
          confirm: () => {
            setPending(null);
            send(true).then(resolve, reject);
          },
          cancel: () => {
            setPending(null);
            reject(new ConfirmCancelledError());
          },
        })
      );
    });

  const dialog = (
    <ConfirmDialog
      open={!!pending}
      title={t('action-confirm-title')}
      confirmLabel={t('action-confirm-continue')}
      destructive
      message={
        <Stack spacing={1}>
          <Typography variant="body2">{t('action-confirm-message')}</Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {(pending?.warnings ?? []).map((warning, index) => (
              <Typography key={`${warning.code}-${index}`} component="li" variant="body2">
                {warningText(warning, t, combat?.actorRounds ?? null)}
              </Typography>
            ))}
          </Box>
        </Stack>
      }
      onClose={() => pending?.cancel()}
      onConfirm={() => pending?.confirm()}
    />
  );
  return { run, dialog };
};
