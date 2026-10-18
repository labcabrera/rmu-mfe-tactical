import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Stack } from '@mui/material';
import { FlowStep, FlowSteps } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action } from '../../api/action.dto';
import { useDeleteAction } from './useDeleteAction';

export type FlowButton = { label: string; onClick: () => void; disabled?: boolean };

/**
 * Frame of every action in the resolution dialog: the steps (done ones summarized, the current one open), and
 * a sticky footer with a confirmed delete, an optional back button and the step's main button.
 * Once the action is done, the main button moves on to the next pending action.
 */
const ActionFlow: FC<{
  action: Action;
  steps: FlowStep[];
  activeIndex: number;
  primary?: FlowButton;
  back?: FlowButton;
  /** Called after the action is deleted (the dialog closes). */
  onDeleted: () => void;
  /** Opens the next action waiting for input, if there is one. */
  onNextPending?: () => void;
}> = ({ action, steps, activeIndex, primary, back, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const { requestDelete, dialog } = useDeleteAction(action, onDeleted);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const done = action.status === 'completed';

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
            <Button color="error" startIcon={<DeleteIcon />} onClick={requestDelete}>
              {t('delete')}
            </Button>
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
      {dialog}
    </>
  );
};

export default ActionFlow;
