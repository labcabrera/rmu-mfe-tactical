import React, { useEffect, useState } from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';

import { API_ITEMS_URL } from '../../constants/environment';

const TacticalCharacterAddItem = ({ tacticalCharacter }) => {

    const variant = "standard";

    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            const response = await fetch(`${API_ITEMS_URL}/items`);
            const data = await response.json();
            setItems(data.content);
        };
        fetchItems();
    }, []);

    const handleSelectedChange = (e) => {
        setSelectedItem(e.target.value);
    };

    const addItem = () => {
        console.log("TacticalCharacterAddItem.addItem");
    };

    if (!tacticalCharacter || !items) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-character-add-item">
            Selected: {JSON.stringify(selectedItem, null, 2)}
            <Grid container spacing={2}>
                <Grid size={8}>
                    <FormControl fullWidth>
                        <InputLabel id="select-label-item-to-add">Item to add</InputLabel>
                        <Select
                            id="select-item-to-add"
                            labelId="select-label-item-to-add"
                            label="Item to add"
                            value={selectedItem}
                            required
                            variant={variant}
                            onChange={handleSelectedChange}>
                            {items.map((item, index) => (<MenuItem key={index} value={item.id}>{item.id}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={4}>
                    <IconButton variant={variant} onClick={addItem}>
                        <AddIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </div>
    );
}

export default TacticalCharacterAddItem;