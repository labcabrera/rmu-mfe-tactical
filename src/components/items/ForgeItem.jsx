import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useLocation } from "react-router-dom";

import Grid from '@mui/material/Grid2';
import ForgeItemAttributes from "./ForgeItemAttributes";
import ForgeItemCategories from "./ForgeItemCategories";
import ForgeItemList from "./ForgeItemList";

import { API_ITEMS_URL } from '../../constants/environment';

const ForgeItem = () => {

    const debugMode = true;

    const location = useLocation();
    const { t } = useTranslation();

    const tacticalGame = location.state?.tacticalGame;
    const tacticalCharacter = location.state?.tacticalCharacter;

    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: '',
            skillId: '',
            fumble: ''
        },
        info: {
            cost: {
                value: '',
                type: '',
            },
            lenght: '',
            strength: '',
            weight: '',
            productionTime: ''
        }
    });

    const mapItem = (item) => {
        item.name = t(item.id);
        return item;
    };

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

    useEffect(() => {
        fetchItems('weapon');
    }, []);

    if (!tacticalGame || !tacticalCharacter) {
        return <p>Loading...</p>
    }

    return (
        <div className="generic-main-content">
            <Grid container spacing={2}>
                <Grid size={6}>
                    <ForgeItemCategories onChange={fetchItems} />
                    <ForgeItemList items={items} />
                </Grid>
                <Grid size={6}>
                    <ForgeItemAttributes formData={formData} setFormData={setFormData} />
                </Grid>
            </Grid>
            {debugMode ? (
                <div>
                    <h3>formData</h3>
                    <pre>
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div >
    );
}

export default ForgeItem;
