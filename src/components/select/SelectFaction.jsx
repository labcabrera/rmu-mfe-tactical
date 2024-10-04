import React from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const SelectFaction = ({ factions, value, onChange }) => {

    const handleFactionChange = (e) => {
        onChange(e.target.value);
    };

    return (
        <FormControl fullWidth>
            <InputLabel id="select-faction-label">Faction</InputLabel>
            <Select
                id="select-faction"
                labelId="select-faction-label"
                label="Faction"
                value={(value === undefined || value === null || factions.length === 0) ? '' : value}
                variant='outlined'
                required
                onChange={handleFactionChange}>
                {factions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
        </FormControl>
    );
}

export default SelectFaction;