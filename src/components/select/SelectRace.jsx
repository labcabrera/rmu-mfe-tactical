import React, { useState, useEffect } from "react";

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { API_CORE_URL } from '../../constants/environment';

const CharacterListItemAvatar = ({ value, onChange }) => {

    const [races, setRaces] = useState([]);

    const handleChange = (event) => {
        const value = event.target.value;
        const race = races.find(e => e.id === value);
        onChange(value, race);
    }

    useEffect(() => {
        const fetchRaces = async () => {
            const response = await fetch(`${API_CORE_URL}/races`);
            const data = await response.json();
            setRaces(data.content);
        };
        fetchRaces();
    }, []);

    return (
        <FormControl fullWidth variant="standard">
            <InputLabel id="select-race-label">Race</InputLabel>
            <Select
                id="select-race"
                labelId="select-race-label"
                label="Race"
                value={value}
                variant='standard'
                onChange={handleChange}>
                {races.map((option, index) => (<MenuItem key={index} value={option.id}>{option.name}</MenuItem>))}
            </Select>
        </FormControl>
    );
}

export default CharacterListItemAvatar;