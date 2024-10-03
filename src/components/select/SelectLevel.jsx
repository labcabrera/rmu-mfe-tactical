import React from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const SelectLevel = ({ value, onChange }) => {

    const levels = Array.from({ length: 101 }, (_, index) => index);

    const handleLevelChange = (e) => {
        onChange(e.target.value);
    };

    return (
        <FormControl fullWidth>
            <InputLabel id='select-level-label'>Level</InputLabel>
            <Select
                id='select-level'
                labelId='select-level-label'
                label='Level'
                value={value}
                required
                variant='standard'
                onChange={handleLevelChange}>
                {levels.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
        </FormControl>
    );
}

export default SelectLevel;