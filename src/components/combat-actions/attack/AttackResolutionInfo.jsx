import React from 'react';

import Grid from '@mui/material/Grid';

import ActionPointSelector from '../../shared/ActionPointSelector';
import PenaltyTextField from '../../input/PenaltyTextField';
import ArmorTextField from '../../input/ArmorTextField';
import AttackTextField from '../../input/AttackTextField';
import DefenseTextField from '../../input/DefenseTextField';
import SizeTextField from '../../input/SizeTextField';
import SelectAttackMode from '../../select/SelectAttackMode';
import SelectRestrictedQuarters from '../../select/SelectRestrictedQuarters';
import SelectChargeSpeed from '../../select/SelectChargeSpeed';

const AttackResolutionInfo = ({ formData, character }) => {

    return (
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <ActionPointSelector value={formData.actionPoints} min={2} max={4} />
            </Grid>
        </Grid>
    );
};

export default AttackResolutionInfo;