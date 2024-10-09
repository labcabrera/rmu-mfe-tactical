import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

import { Avatar, Card, CardContent, Typography } from "@mui/material";
import SelectItem from "../../select/SelectItem";

import { API_TACTICAL_URL } from "../../../constants/environment";

const CharacterItemSlot = ({ character, setCharacter, slot }) => {

    const { t } = useTranslation();

    const [item, setItem] = useState();
    const [itemOptions, setItemOptions] = useState([]);

    const [skillBonus, setSkillBonus] = useState(-25);

    const loadEquipedItem = () => {
        if (character.equipment[slot]) {
            const itemId = character.equipment[slot];
            const item = character.items.find(e => e.id == itemId);
            setItem(item);
            if (item && item.weapon && item.weapon.skillId) {
                const skill = character.skills.find(e => e.skillId == item.weapon.skillId);
                if (skill) {
                    setSkillBonus(skill.totalBonus);
                }
            }
            loadAvailableItems();
        }
    };

    const handleItemChange = async (itemId) => {
        console.log(`item change ${item}`);
        const response = await equipItem(itemId, slot);
        if (response == 200) {
            const responseBody = response.json();
            setCharacter(responseBody);
        }
    };

    const equipItem = async (itemId, slot) => {
        const request = {
            itemId: itemId,
            slot: slot
        };
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            };
            const response = await fetch(`${API_TACTICAL_URL}/characters/${character.id}/equipment`, requestOptions);
            if (response.status == 200) {
                const responseBody = await response.json();
                setCharacter(responseBody);
            } else {
                //Error
            }
        } catch (error) {
            console.error(`TacticalCharacterEquipment.error: ${error}`);
        }
    }

    const loadAvailableItems = () => {
        var list = [];
        switch (slot) {
            case 'mainHand':
                //list = character.items.filter(e => (e.category === 'weapon' || e.category === 'shield') && e.id != item.id);
                list = character.items.filter(e => e.weapon);
                break;
        }
        setItemOptions(list);
    };

    useEffect(() => {
        loadEquipedItem();
    }, [character]);

    if (!character || !slot) {
        return <p>Loading...</p>
    }

    if (!item) {
        return <p>No item selected</p>
    }

    return (
        <>
            <Card>
                <CardContent>
                    <Typography>{t(slot)}</Typography>
                    <Avatar src={`/static/images/items/${item.itemTypeId}.png`} variant="square"/>
                    <Typography>{item.name}</Typography>
                    {item.weapon ? (
                        <>
                            <Typography>Skill: {item.weapon.skillId}</Typography>
                            <Typography>Skill bonus: {skillBonus}</Typography>
                        </>
                    ) : null}
                    <SelectItem options={itemOptions} onChange={handleItemChange} />
                </CardContent>
            </Card>
            <div>wip character item slot</div>
            <pre>
                {JSON.stringify(item, null, 2)}
            </pre>
        </>
    );
};

export default CharacterItemSlot;