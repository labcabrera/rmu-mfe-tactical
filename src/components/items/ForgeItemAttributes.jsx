import React from "react";

import Grid from '@mui/material/Grid2';

import HeightTextField from "../input/HeightTextField";

const ForgeItemAttributes = ({ formData, setFormData }) => {

    if (!formData || !setFormData) {
        return <p>Loading...</p>
    }

    const handleHeightChange = (e) => {
        handleFormDataChange('info', 'height', parseFloat(e.target.value));
    };

    const handleFormDataChange = (field1, field2, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [field1]: {
                ...prevState[field1],
                [field2]: value
            }
        }));
    };

    return (
        <Grid container spacing={2}>
            <Grid size={2}>
                <HeightTextField value={formData.info.height} onChange={handleHeightChange} />
            </Grid>
        </Grid>
    );
}

export default ForgeItemAttributes;
