import React from "react";

import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

const ActionPointSelector = ({ value, onChange }) => {

    const handleChange = (e) => {
        onChange(parseInt(e.target.value));
    };

    return (
        <>
            <Typography component="legend">Action points</Typography>
            <Rating
                name="size-large"
                value={value}
                defaultValue={2}
                max={4}
                size="large"
                onChange={handleChange} />
        </>
    );
}

export default ActionPointSelector;