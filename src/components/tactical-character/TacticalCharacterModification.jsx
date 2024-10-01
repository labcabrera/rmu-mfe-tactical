import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";

import NavigateBeforeOutlinedIcon from '@mui/icons-material/NavigateBeforeOutlined';
import SaveIcon from '@mui/icons-material/Save';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';

import TacticalCharacterAddItem from './TacticalCharacterAddItem';
import TacticalCharacterEquipment from './TacticalCharacterEquipment';
import TacticalCharacterModificationAttributes from './TacticalCharacterModificationAttributes';
import TacticalCharacterSkillModification from './TacticalCharacterSkillModification';
import TacticalCharacterSkillDataGrid from './TacticalCharacterSkillDataGrid';

import { API_TACTICAL_URL } from "../../constants/environment";

const TacticalCharacterModification = () => {

    const debugMode = true;
    const { characterId } = useParams();
    const navigate = useNavigate();

    const [tabValue, setTabValue] = useState('1');

    const [tacticalCharacter, setTacticalCharacter] = useState();
    const [formData, setFormData] = useState();
    const [tacticalGame, setTacticalGame] = useState();
    const [factions, setFactions] = useState();

    const fetchTacticalCharacter = async () => {
        try {
            const response = await fetch(`${API_TACTICAL_URL}/characters/${characterId}`);
            const responseBody = await response.json();
            setTacticalCharacter(responseBody);
        } catch (error) {
            console.error(`TacticalCharacterModification.fetchTacticalGame error ${error}`);
        }
    };

    const fetchTacticalGame = async () => {
        if (!tacticalCharacter) {
            return;
        }
        try {
            const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${tacticalCharacter.tacticalGameId}`);
            const responseBody = await response.json();
            setTacticalGame(responseBody);
            setFactions(responseBody.factions);
        } catch (error) {
            console.error(`TacticalCharacterModification.fetchTacticalGame error ${error}`);
        }
    };

    const createFormData = () => {
        if (!tacticalCharacter) {
            return;
        }
        const data = {
            tacticalGameId: tacticalCharacter.tacticalGameId,
            name: tacticalCharacter.name,
            faction: tacticalCharacter.faction,
            info: tacticalCharacter.info,
            defense: tacticalCharacter.defense,
            hp: tacticalCharacter.hp,
            endurance: tacticalCharacter.endurance,
            power: tacticalCharacter.power,
            initiative: tacticalCharacter.initiative,
            effects: tacticalCharacter.effects,
            skills: tacticalCharacter.skills,
            items: tacticalCharacter.items,
            equipment: tacticalCharacter.equipment,
            description: tacticalCharacter.description
        };
        setFormData(data);
    };

    const updateTacticalCharacter = async (e) => {
        try {
            e.preventDefault();
            const requestOptions = {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            };
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}`, requestOptions);
            if (response.status == 200) {
                navigate(`/tactical/view/${tacticalCharacter.tacticalGameId}`, { state: { tacticalGame: tacticalGame } });
            } else {
                console.log(`TacticalCharacterModification.updateTacticalCharacter error ${error}`);
            }
        } catch (error) {
            console.error(`TacticalCharacterModification.updateTacticalCharacter error ${error}`);
        }
    };

    const handleNavigateBackClick = (e) => {
        navigate(`/tactical/view/${tacticalCharacter.tacticalGameId}`, { state: { tacticalGame: tacticalGame } });
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        fetchTacticalCharacter();
    }, []);

    useEffect(() => {
        fetchTacticalGame();
        createFormData();
    }, [tacticalCharacter]);

    if (!tacticalCharacter || !tacticalGame) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-character-edit">
            <div className="tactical-character-edit-actions">
                <Stack spacing={2} direction="row" sx={{
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                }}>
                    <IconButton variant="outlined" onClick={handleNavigateBackClick}>
                        <NavigateBeforeOutlinedIcon />
                    </IconButton>
                    <IconButton variant="outlined" onClick={updateTacticalCharacter}>
                        <SaveIcon />
                    </IconButton>
                </Stack>
            </div>

            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                            <Tab label="Attributes" value="1" />
                            <Tab label="Skills" value="2" />
                            <Tab label="Items" value="3" />
                            <Tab label="Debug" value="4" />
                            <Tab label="Experimental" value="5" />
                        </TabList>
                    </Box>
                    <TabPanel value="1">
                        <TacticalCharacterModificationAttributes formData={formData} setFormData={setFormData} factions={factions} />
                    </TabPanel>
                    <TabPanel value="2">
                        <TacticalCharacterSkillModification tacticalCharacter={tacticalCharacter} setTacticalCharacter={setTacticalCharacter} />
                    </TabPanel>
                    <TabPanel value="3">
                        <TacticalCharacterEquipment tacticalCharacter={tacticalCharacter} setTacticalCharacter={setTacticalCharacter} />
                        <TacticalCharacterAddItem tacticalCharacter={tacticalCharacter} setTacticalCharacter={setTacticalCharacter} />
                    </TabPanel>
                    <TabPanel value="4">
                        <div>
                            <h3>formData</h3>
                            <pre>
                                {JSON.stringify(formData, null, 2)}
                            </pre>
                            <h3>tacticalCharacter</h3>
                            <pre>
                                {JSON.stringify(tacticalCharacter, null, 2)}
                            </pre>
                            <h3>tacticalGame</h3>
                            <pre>
                                {JSON.stringify(tacticalCharacter, null, 2)}
                            </pre>
                        </div>
                    </TabPanel>
                    <TabPanel value="5">
                        <TacticalCharacterSkillDataGrid tacticalCharacter={tacticalCharacter} setTacticalCharacter={setTacticalCharacter} />
                    </TabPanel>
                </TabContext>
            </Box>
        </div>
    );
}

export default TacticalCharacterModification;