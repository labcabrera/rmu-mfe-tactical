import React from 'react';
import AttackResolutionAttributes from './AttackResolutionAttributes';
import { Typography } from '@mui/material';

const AttackResolutionDetail = ({ attackKey, formData, setFormData, character }) => {

    return (
        <>
            <Typography>Attack {attackKey}</Typography>
            <AttackResolutionAttributes attackKey={attackKey} formData={formData} setFormData={setFormData} character={character} />
        </>
    );
};

export default AttackResolutionDetail;