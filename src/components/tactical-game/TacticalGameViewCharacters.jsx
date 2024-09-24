import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddBoxIcon from '@mui/icons-material/AddBox';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';

import { API_TACTICAL_URL } from "../../constants/environment";

import TacticalGameViewCharactersListItem from "./TacticalGameViewCharactersListItem";

const TacticalGameViewCharacters = ({ tacticalGame }) => {

    const debugMode = false;

    const navigate = useNavigate();
    const [tacticalCharacters, setTacticalCharacters] = useState([]);



    const removeCharacter = (id) => {
        setTacticalCharacters(tacticalCharacters.filter(item => item.id !== id));
    };

    useEffect(() => {
        const fetchTacticalCharacters = async () => {
            const url = `${API_TACTICAL_URL}/characters/?tacticalGameId=${tacticalGame.id}&page=0&size=100`;
            try {
                const response = await fetch(url, { method: "GET", });
                const data = await response.json();
                setTacticalCharacters(data.content);
            } catch (error) {
                console.error("error loading characters :" + error);
            }
        };
        fetchTacticalCharacters();
    }, []);

    const handleAddNewCharacter = () => {
        navigate("/tactical/characters/creation", { state: { tacticalGame: tacticalGame } });
    };

    return (
        <div>
            <h3>Characters</h3>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {tacticalCharacters.map((item) => (
                    <TacticalGameViewCharactersListItem
                        character={item}
                        tacticalGame={tacticalGame}
                        onRemoveCharacter={removeCharacter} />
                ))}
            </List>
            <Stack spacing={0} direction="row" sx={{
                justifyContent: "flex-start",
                alignItems: "flex-start",
            }}>
                <IconButton variant="outlined" onClick={handleAddNewCharacter}>
                    <AddBoxIcon />
                </IconButton>
            </Stack>
            {debugMode ? (
                <div>
                    <pre>
                        {JSON.stringify(tacticalCharacters, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div >
    );
};

export default TacticalGameViewCharacters;