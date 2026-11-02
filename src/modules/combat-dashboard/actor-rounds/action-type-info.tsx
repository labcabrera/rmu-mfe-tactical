import React from 'react';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import { combatActionInfo } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * Category, label key and icon of an action type: the shared lib's, plus the types it does not know yet. Workspace
 * spec 068 adds `use_item` (a healing item of 2 AP), which the lib would show as `other`.
 */
export const actionTypeInfo = (type: string): ReturnType<typeof combatActionInfo> =>
  type === 'use_item'
    ? { category: 'maneuver', labelKey: 'use-item', icon: () => <LocalPharmacyIcon /> }
    : combatActionInfo(type);
