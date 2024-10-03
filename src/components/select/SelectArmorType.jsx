import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { API_CORE_URL } from '../../constants/environment';

const SelectArmorType = ({ value, onChange }) => {

    const { t, i18n } = useTranslation();

    const [armorTypes, setArmorTypes] = useState([]);

    const handleChange = (event) => {
        const value = event.target.value;
        const size = armorTypes.find(e => e.id === value);
        onChange(value, size);
    }

    useEffect(() => {
        const fetchArmorTypes = async () => {
            const response = await fetch(`${API_CORE_URL}/armor-types`);
            const responseBody = await response.json();
            setArmorTypes(responseBody);
        };
        fetchArmorTypes();
    }, []);

    return (
        <FormControl fullWidth variant="standard">
            <InputLabel id="select-amor-type-label">{t('armorType')}</InputLabel>
            <Select
                id="select-amor-type"
                labelId="select-amor-type-label"
                label={t('armorType')}
                value={value}
                variant='standard'
                onChange={handleChange}>
                {armorTypes.map((option, index) => (<MenuItem key={index} value={option.id}>{t(`at-${option.id}`)}</MenuItem>))}
            </Select>
        </FormControl>
    );
}

export default SelectArmorType;