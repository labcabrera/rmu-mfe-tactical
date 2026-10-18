import React, { FC, ReactNode, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Button, IconButton, Menu, MenuItem, Stack } from '@mui/material';
import { ConfirmDialog, FlowStep, FlowSteps, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { deleteAction } from '../../api/action';
import { Action } from '../../api/action.dto';

export type FlowButton = { label: string; onClick: () => void; disabled?: boolean };

/**
 * Frame of every action in the side panel: the steps (done ones summarized, the current one open), and a
 * sticky footer with the step's main button, an optional back button and a "…" menu with a confirmed delete.
 * Once the action is done, the main button moves on to the next pending action.
 */
const ActionFlow: FC<{
  action: Action;
  steps: FlowStep[];
  activeIndex: number;
  primary?: FlowButton;
  back?: FlowButton;
  /** Called after the action is deleted (the panel closes). */
  onDeleted: () => void;
  /** Opens the next action waiting for input, if there is one. */
  onNextPending?: () => void;
  /** Extra entries of the "…" menu. */
  menu?: ReactNode;
}> = ({ action, steps, activeIndex, primary, back, onDeleted, onNextPending, menu }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const { roundActions, setRoundActions } = useContext(CombatContext)!;
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const done = action.status === 'completed';

  const onDelete = () => {
    setConfirmDelete(false);
    deleteAction(action.id, auth)
      .then(() => {
        setRoundActions((roundActions ?? []).filter((a) => a.id !== action.id));
        notify.success(t('action-deleted'));
        onDeleted();
      })
      .catch((err) => notify.error(err));
  };

  const main: FlowButton | undefined =
    done && onNextPending ? { label: t('next-pending-action'), onClick: onNextPending } : primary;

  return (
    <>
      <FlowSteps
        steps={steps}
        activeIndex={activeIndex}
        reviewing={reviewing}
        onReview={setReviewing}
        footer={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <IconButton aria-label={t('more-actions')} onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreHorizIcon />
            </IconButton>
            <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: 'flex-end' }}>
              {back && !done && (
                <Button onClick={back.onClick} disabled={back.disabled}>
                  {back.label}
                </Button>
              )}
              {main && (
                <Button variant="contained" onClick={main.onClick} disabled={main.disabled}>
                  {main.label}
                </Button>
              )}
            </Stack>
          </Stack>
        }
      />
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        {menu}
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            setMenuAnchor(null);
            setConfirmDelete(true);
          }}
        >
          {t('delete')}
        </MenuItem>
      </Menu>
      <ConfirmDialog
        open={confirmDelete}
        title={t('delete-action')}
        message={t('delete-action-confirmation')}
        confirmLabel={t('delete')}
        destructive
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
      />
    </>
  );
};

export default ActionFlow;
