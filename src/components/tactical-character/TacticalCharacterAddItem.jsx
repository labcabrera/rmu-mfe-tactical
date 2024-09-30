import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';

import { API_ITEMS_URL, API_TACTICAL_URL } from '../../constants/environment';

const TacticalCharacterAddItem = ({ tacticalCharacter }) => {

    const variant = "standard";

    const location = useLocation();
    const { t, i18n } = useTranslation();

    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemCategory, setSelectedItemCategory] = useState();

    const itemCategories = ['weapon', 'shield'];

    const mapItem = (item) => {
        item.name = t(item.id);
        return item;
    }

    const fetchItems = async (category) => {
        console.log(`TacticalCharacterAddItem.fetchItems ${category}`);
        const response = await fetch(`${API_ITEMS_URL}/items?category=${category}size=500`);
        const data = await response.json();
        const items = data.content.map(mapItem);
        items.sort((a, b) => a.name.localeCompare(b.name));
        setItems(items);
    };

    const handleSelectedCategoryChange = (e, v) => {
        console.log(`TacticalCharacterAddItem.handleSelectedCategoryChange ${e} ${v}`);
        //setSelectedItemCategory(e.target.value);
        //fetchItems(selectedItemCategory);
    };

    const handleSelectedChange = (e) => {
        setSelectedItemCategory(e.target.value);
    };

    const addItem = async () => {
        try {
            const item = items.find(e => e.id == selectedItem);
            const request = {
                itemTypeId: item.id,
                category: item.category,
                weaponRange: item.weaponRange,
                attackTable: item.attackTable,
                skillId: item.skillId
            };
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            };
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/items`, requestOptions);
            const responseBody = response.json();
            //TODO set useState
            setSelectedItem(null);
        } catch (error) {
            console.error(`TacticalCharacterAddItem.addItem %{error}`);
        }
    };

    if (!tacticalCharacter || !items) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-character-add-item">
            <Grid container spacing={2}>

                <Grid size={8}>
                    <FormControl fullWidth>
                        <InputLabel id="select-label-item-category">Item category</InputLabel>
                        <Select
                            id="select-item-category"
                            labelId="select-label--item-category"
                            label="Item category"
                            value={selectedItemCategory}
                            variant={variant}
                            onChange={handleSelectedCategoryChange}>
                            {itemCategories.map((item, index) => (
                                <MenuItem key={index} value={item}>{item}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={4}>
                </Grid>

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
                            {items.map((item, index) => (
                                <MenuItem key={index} value={item.id}>
                                    <img
                                        src={`/static/images/items/${item.id}.png`}
                                        alt='x'
                                        style={{ width: '30px', height: '30px', marginRight: '8px', borderRadius: '3px' }}
                                    />
                                    {item.name}
                                </MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={4}>
                    <IconButton variant={variant} onClick={addItem}>
                        <AddIcon />
                    </IconButton>
                </Grid>

                <div>
                    <h3>selectedItemCategory</h3>
                    <pre>
                        {JSON.stringify(selectedItemCategory, null, 2)}
                    </pre>
                    <h3>items</h3>
                    <pre>
                        {JSON.stringify(items, null, 2)}
                    </pre>
                </div>

            </Grid>
        </div>
    );
}

export default TacticalCharacterAddItem;