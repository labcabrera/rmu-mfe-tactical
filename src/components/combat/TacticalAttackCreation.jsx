import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import TextField from '@mui/material/TextField';

import { API_TACTICAL_URL } from "../../constants/environment";

const TacticalAttackCreation = () => {

    const debugMode = true;

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const phaseStart = searchParams.get('phaseStart');

    const tacticalGame = location.state?.tacticalGame;
    const character = location.state?.character;


    const [formData, setFormData] = useState({
        name: '',
        description: '',
        phaseStart: phaseStart
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        };
        const url = `${API_TACTICAL_URL}/tactical-games`;
        fetch(url, requestOptions)
            .then(response => response.json())
            .then(data => navigate("/tactical/view/" + data.id, { state: { tacticalGame: data } }));
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    }

    return (
        <div className="tactical-game-creation">
            <p>wip declare attack</p>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Name"
                    variant="outlined"
                    fullWidth
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    required />
                <TextField
                    label="Description"
                    variant="outlined"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    margin="normal" />
            </form>
            {debugMode ? (
                <div>
                    <h2>formData</h2>
                    <pre>
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                    <h2>character</h2>
                    <pre>
                        {JSON.stringify(character, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div>
    );
}

export default TacticalAttackCreation;