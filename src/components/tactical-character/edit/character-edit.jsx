import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

//TODO remove lab tab context and use default MUI tabs
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';

import CharacterEquipment from '../items/character-equipment';
import CharacterSkillsDataGrid from '../skills/character-skills-data-grid';
import TacticalCharacterStatisticsModification from '../TacticalCharacterStatisticsModification';
import CharacterEditActions from './character-edit-actions';
import CharacterEditAttributes from './character-edit-attributes';

import { API_TACTICAL_URL } from '../../../constants/environment';
import CharacterAttacks from '../attacks/CharacterAttacks';

const CharacterEdit = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);

    const { characterId } = useParams();

    const tabValue = searchParams.get('tab') || 'info';

    const [character, setCharacter] = useState();
    const [formData, setFormData] = useState();
    const [game, setGame] = useState();
    const [factions, setFactions] = useState();

    const fetchTacticalCharacter = async () => {
        try {
            const response = await fetch(`${API_TACTICAL_URL}/characters/${characterId}`);
            const responseBody = await response.json();
            setCharacter(responseBody);
        } catch (error) {
            console.error(`TacticalCharacterModification.fetchTacticalGame error ${error}`);
        }
    };

    const fetchTacticalGame = async () => {
        if (!character) {
            return;
        }
        try {
            const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${character.gameId}`);
            const responseBody = await response.json();
            setGame(responseBody);
            setFactions(responseBody.factions);
        } catch (error) {
            console.error(`TacticalCharacterModification.fetchTacticalGame error ${error}`);
        }
    };

    const createFormData = () => {
        if (!character) {
            return;
        }
        const data = {
            gameId: character.gameId,
            name: character.name,
            faction: character.faction,
            statistics: character.statistics,
            info: character.info,
            movement: character.movement,
            defense: character.defense,
            hp: character.hp,
            endurance: character.endurance,
            power: character.power,
            initiative: character.initiative,
            effects: character.effects,
            skills: character.skills,
            items: character.items,
            equipment: character.equipment,
            description: character.description
        };
        setFormData(data);
    };

    const handleTabChange = (event, newValue) => {
        //setTabValue(newValue);
        navigate(`?tab=${newValue}`);
    };

    useEffect(() => {
        fetchTacticalCharacter();
    }, []);

    useEffect(() => {
        fetchTacticalGame();
        createFormData();
    }, [character]);

    if (!character || !game) {
        return <p>Loading...</p>
    }

    return (
        <div className='tactical-character-edit'>
            <CharacterEditActions tacticalGame={game} tacticalCharacter={character} formData={formData} setFormData={setFormData} />
            <Box>
                <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleTabChange} aria-label='lab API tabs example'>
                            <Tab label='Info' value='info' />
                            <Tab label='Attributes' value='attributes' />
                            <Tab label='Attacks' value='attacks' />
                            <Tab label='Skills' value='skills' />
                            <Tab label='Items' value='items' />
                            <Tab label='Debug Form' value='debug-form' />
                            <Tab label='Debug Character' value='debug-character' />
                        </TabList>
                    </Box>
                    <TabPanel value='info'>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <CharacterEditAttributes formData={formData} setFormData={setFormData} factions={factions} size='normal' variant='outlined' />
                            </Grid>
                            <Grid item xs={6}>
                            </Grid>
                        </Grid>
                    </TabPanel>
                    <TabPanel value='attributes'>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TacticalCharacterStatisticsModification formData={formData} setFormData={setFormData} />
                            </Grid>
                        </Grid>
                    </TabPanel>
                    <TabPanel value='attacks'>
                        <CharacterAttacks character={character} />
                    </TabPanel>
                    <TabPanel value='skills'>
                        <CharacterSkillsDataGrid tacticalCharacter={character} setTacticalCharacter={setCharacter} />
                    </TabPanel>
                    <TabPanel value='items'>
                        <CharacterEquipment game={game} character={character} setCharacter={setCharacter} />
                    </TabPanel>
                    <TabPanel value='debug-form'>
                        <h3>formData</h3>
                        <pre>
                            {JSON.stringify(formData, null, 2)}
                        </pre>
                    </TabPanel>
                    <TabPanel value='debug-character'>
                        <h3>tacticalCharacter</h3>
                        <pre>
                            {JSON.stringify(character, null, 2)}
                        </pre>
                    </TabPanel>
                </TabContext>
            </Box>
        </div>
    );
}

export default CharacterEdit;