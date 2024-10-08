import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import Grid from '@mui/material/Grid2';

import ArmorButton from '../button/ArmorButton';
import ShieldButton from '../button/ShieldButton';
import WeaponButton from '../button/WeaponButton';
import ItemList from '../shared/ItemList';
import ForgeButton from '../button/ForgeButton';

import { API_ITEMS_URL, API_TACTICAL_URL } from '../../constants/environment';

const TacticalCharacterAddItem = ({ tacticalGame, tacticalCharacter, setTacticalCharacter }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    const [items, setItems] = useState([]);

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

    const fetchWeapons = async () => { await fetchItems('weapon'); };
    const fetchShields = async () => { await fetchItems('shield'); };
    const fetchArmors = async () => { await fetchItems('armor'); };

    const handleAddItem = async (itemId) => {
        const item = items.find(item => item.id == itemId);
        const data = {
            itemTypeId: item.id,
            category: item.category,
            weapon: item.weapon,
            weaponRange: item.weaponRange,
            armor: item.armor,
            info: item.info
        };
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            };
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/items`, requestOptions);
            const responseBody = await response.json();
            setTacticalCharacter(responseBody);
            setSelectedItem(null);
        } catch (error) {
            console.error(`TacticalCharacterAddItem.addItem ${error}`);
        }
    };

    const handleForgeButtonClick = (e) => {
        navigate(`/tactical/forge/${tacticalGame.id}`, {
            state: { tacticalGame: tacticalGame, tacticalCharacter: tacticalCharacter }
        });
        return;
    };

    useEffect(() => {
        fetchItems('weapon');
    }, []);

    if (!tacticalCharacter) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-character-add-item">
            <ForgeButton onClick={handleForgeButtonClick} size={60} />
            <Grid container spacing={2}>
                <Grid size={8}>
                    <WeaponButton onClick={fetchWeapons} size={40} />
                    <ShieldButton onClick={fetchShields} size={40} />
                    <ArmorButton onClick={fetchArmors} size={40} />
                </Grid>
                <Grid size={4}>
                </Grid>

                <Grid size={12}>
                    <ItemList items={items} onAddItem={handleAddItem} />
                </Grid>
            </Grid>
        </div>
    );
}

export default TacticalCharacterAddItem;