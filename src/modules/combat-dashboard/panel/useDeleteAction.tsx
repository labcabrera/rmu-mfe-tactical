import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { ConfirmDialog, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { deleteAction } from '../../api/action';
import { Action } from '../../api/action.dto';
import { useCombatActions } from '../../combat/combat-context';

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
  const notify = useApiNotify();
  const { setRoundActions, refreshRound } = useCombatActions();
  const [confirming, setConfirming] = useState(false);

  const onConfirm = () => {
    setConfirming(false);
    deleteAction(action.id, auth)
      .then(() => {
        setRoundActions((previous) => (previous ?? []).filter((a) => a.id !== action.id));
        // Workspace spec 083: what the action reserved goes back to the actors and to the other open actions.
        refreshRound();
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
