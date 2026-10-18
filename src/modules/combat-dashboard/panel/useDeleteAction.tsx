import React, { ReactNode, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { ConfirmDialog, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { deleteAction } from '../../api/action';
import { Action } from '../../api/action.dto';

/**
 * Confirmed delete of an action: `requestDelete` opens the confirmation and `dialog` has to be rendered.
 * Once deleted, the action leaves the round and `onDeleted` is called.
 */
export const useDeleteAction = (
  action: Action,
  onDeleted: () => void
): { requestDelete: () => void; dialog: ReactNode } => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const { roundActions, setRoundActions } = useContext(CombatContext)!;
  const [confirming, setConfirming] = useState(false);

  const onConfirm = () => {
    setConfirming(false);
    deleteAction(action.id, auth)
      .then(() => {
        setRoundActions((roundActions ?? []).filter((a) => a.id !== action.id));
        notify.success(t('action-deleted'));
        onDeleted();
      })
      .catch((err) => notify.error(err));
  };

  return {
    requestDelete: () => setConfirming(true),
    dialog: (
      <ConfirmDialog
        open={confirming}
        title={t('delete-action')}
        message={t('delete-action-confirmation')}
        confirmLabel={t('delete')}
        destructive
        onClose={() => setConfirming(false)}
        onConfirm={onConfirm}
      />
    ),
  };
};
