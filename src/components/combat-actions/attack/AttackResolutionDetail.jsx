import React from 'react';
import AttackResolutionAttributes from './AttackResolutionAttributes';

const AttackResolutionDetail = ({ attackKey, formData, setFormData, character }) => {

    return (
        <>
            <div>wip attack resolution detail</div>
            <AttackResolutionAttributes attackKey={attackKey} formData={formData} setFormData={setFormData} character={character} />
        </>
    );
};

export default AttackResolutionDetail;