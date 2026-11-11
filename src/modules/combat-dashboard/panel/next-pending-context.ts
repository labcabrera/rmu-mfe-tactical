import { createContext } from 'react';

/**
 * Name of the next action waiting for input, for the button that opens it once the current one is done
 * (workspace spec 085, 1.9: "Next: Melee attack of Buugug").
 */
export const NextPendingLabelContext = createContext<string | undefined>(undefined);
