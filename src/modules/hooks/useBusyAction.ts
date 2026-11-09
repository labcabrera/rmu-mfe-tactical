import { useState } from 'react';
import { useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * Tracks an API call in a `busy` flag and notifies its error: `run(call.then(...))` covers what is done with the answer
 * too, so an error thrown there is notified as well.
 */
export const useBusyAction = () => {
  const notify = useApiNotify();
  const [busy, setBusy] = useState(false);
  const run = (promise: Promise<unknown>): Promise<void> => {
    setBusy(true);
    return promise
      .then(() => undefined)
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };
  return { busy, run };
};
