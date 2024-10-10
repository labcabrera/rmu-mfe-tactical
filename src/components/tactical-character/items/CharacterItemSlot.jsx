import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

import { Avatar, Card, CardContent, Typography } from "@mui/material";
import SelectItem from "../../select/SelectItem";

import { API_TACTICAL_URL } from "../../../constants/environment";

const CaracterItemCard = ({ item }) => {
    return (
        <>
            <Avatar
                src={`/static/images/items/${item.itemTypeId}.png`}
                variant="square"
                sx={{ width: 100, height: 100 }} />
            <Typography>{item.name}</Typography>
            {item.weapon ? (
                <>
                    <Typography variant="subtitle2" gutterBottom>{t(item.weapon.skillId)}: {skillBonus}</Typography>
                </>
            ) : null}
        </>
    );
}

const CharacterItemSlot = ({ character, setCharacter, slot }) => {

    const { t } = useTranslation();

    const [item, setItem] = useState();
    const [itemOptions, setItemOptions] = useState([]);

    const [skillBonus, setSkillBonus] = useState();

    const loadEquipedItem = () => {
        if (character.equipment[slot]) {
            const itemId = character.equipment[slot];
            const item = character.items.find(e => e.id == itemId);
            setItem(item);
            if (item && item.weapon && item.weapon.skillId) {
                const skill = character.skills.find(e => e.skillId == item.weapon.skillId);
                if (skill) {
                    setSkillBonus(skill.totalBonus);
                } else {
                    setSkillBonus(-25);
                }
            }
        } else {
            setItem(null);
            setSkillBonus(null);
        }
        loadAvailableItems();
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
                list = character.items.filter(e => e.weapon && !e.shield);
                break;
            case 'offHand':
                //TODO filtrar solo de una mano
                list = character.items.filter(e => e.weapon);
                break;
            case 'body':
                list = character.items.filter(e => e.armor);
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
        <Card>
            <CardContent>
                <Typography>{t(slot)}</Typography>
                <Typography variant="subtitle2" gutterBottom>No item selected</Typography>
            </CardContent>
        </Card>
    }

    return (
        <>
            <Card>
                <CardContent>
                    <Typography>{t(slot)}</Typography>
                    {item ? (
                        <>
                            <Avatar
                                src={`/static/images/items/${item.itemTypeId}.png`}
                                variant="square"
                                sx={{ width: 100, height: 100 }} />
                            <Typography>{item.name}</Typography>
                        </>
                    ) : <Typography>No item selected</Typography>}
                    {item?.weapon ? (
                        <>
                            <Typography variant="subtitle2" gutterBottom>{t(item.weapon.skillId)}: {skillBonus}</Typography>
                        </>
                    ) : null}
                    <SelectItem options={itemOptions} onChange={handleItemChange} />
                </CardContent>
            </Card>
        </>
    );
};

export default CharacterItemSlot;