import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';

import { API_ITEMS_URL, API_TACTICAL_URL } from '../../constants/environment';

const TacticalCharacterAddItem = ({ tacticalCharacter, setTacticalCharacter }) => {

    const variant = "standard";
    const { t, i18n } = useTranslation();

    const itemCategories = [
        {category: 'weapon', name: 'weapons'},
        {category: 'shield', name: 'shields'},
        {category: 'armor', name: 'armors'}];

    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState();

    const [itemForm, setItemForm] = useState();

    const mapItem = (item) => {
        item.name = t(item.id);
        return item;
    }

    const fetchItems = async (category) => {
        try {
            console.log(`TacticalCharacterAddItem.fetchItems ${category}`);
            const response = await fetch(`${API_ITEMS_URL}/items?category=${category}&size=500`);
            const responseBody = await response.json();
            const items = responseBody.content.map(mapItem);
            items.sort((a, b) => a.name.localeCompare(b.name));
            setItems(items);
        } catch (error) {
            console.error(`TacticalCharacterAddItem.fetchItems error ${error}`);
        }
    };

    const handleSelectedItemChange = (e) => {
        console.log(`TacticalCharacterAddItem.handleSelectedItemChange ${e.target.value}`);
        const item = items.find(item => item.id == e.target.value);
        const data = {
            itemTypeId: item.id,
            category: item.category,
            weapon: item.weapon,
            weaponRange: item.weaponRange,
            info: item.info
        };
        setItemForm(data);
    };

    const addItem = async () => {
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemForm)
            };
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/items`, requestOptions);
            const responseBody = await response.json();
            setTacticalCharacter(responseBody);
            setSelectedItem(null);
        } catch (error) {
            console.error(`TacticalCharacterAddItem.addItem ${error}`);
        }
    };

    useEffect(() => {
        fetchItems('weapon');
    }, []);

    if (!tacticalCharacter) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-character-add-item">
            <Typography variant="h6" component="div">Add item</Typography>
            <Grid container spacing={2}>
                <Grid size={8}>
                    {itemCategories.map((e, index) => (
                        <Button variant={variant} onClick={() => fetchItems(e.category)}>{t(e.name)}</Button>
                    ))}
                </Grid>
                <Grid size={4}>
                </Grid>

                <Grid size={8}>
                    <FormControl fullWidth>
                        <InputLabel id="select-label-item-to-add">Item to add</InputLabel>
                        <Select id="select-item-to-add" labelId="select-label-item-to-add" label="Item to add" variant={variant}
                            onChange={handleSelectedItemChange}>
                            {items.map((item, index) => (
                                <MenuItem key={index} value={item.id}>
                                    <img
                                        src={`/static/images/items/${item.id}.png`}
                                        alt='x'
                                        style={{ width: '40px', height: '40px', marginRight: '8px', borderRadius: '2px' }}
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

                {/* <div>
                    <h3>items</h3>
                    <pre>
                        {JSON.stringify(itemForm, null, 2)}
                    </pre>
                </div> */}

            </Grid>
        </div>
    );
}

export default TacticalCharacterAddItem;