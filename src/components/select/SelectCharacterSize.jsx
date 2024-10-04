import React, { useState, useEffect } from "react";

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { API_CORE_URL } from '../../constants/environment';

const SelectCharacterSize = ({ value, onChange }) => {

    const [sizes, setSizes] = useState([]);

    const handleChange = (event) => {
        const value = event.target.value;
        const size = sizes.find(e => e.id === value);
        onChange(value, size);
    }

    useEffect(() => {
        const fetchSizes = async () => {
            const response = await fetch(`${API_CORE_URL}/character-sizes`);
            const responseBody = await response.json();
            setSizes(responseBody);
        };
        fetchSizes();
    }, []);

    return (
        <FormControl fullWidth>
            <InputLabel id="select-size-label">Size</InputLabel>
            <Select
                id="select-size"
                labelId="select-size-label"
                label="Size"
                value={value}
                variant='outlined'
                onChange={handleChange}>
                {sizes.map((option, index) => (<MenuItem key={index} value={option.id}>{option.name}</MenuItem>))}
            </Select>
        </FormControl>
    );
}

export default SelectCharacterSize;