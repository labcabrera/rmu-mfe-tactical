import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import SaveButton from '../../button/SaveButton';

import { API_TACTICAL_URL } from "../../../constants/environment";
import { ACTION_BUTTON_SIZE } from '../../../constants/ui';

const TacticalGameCreation = () => {

    const navigate = useNavigate();

    const debugMode = false;

    const [formData, setFormData] = useState({
        name: '',
        description: ''
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
            <div className="tactical-game-view-actions">
                <Stack spacing={2} direction="row" sx={{
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                }}>
                    <SaveButton onClick={handleSubmit} size={ACTION_BUTTON_SIZE} />
                </Stack>
            </div>
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
                <pre>
                    {JSON.stringify(formData, null, 2)}
                </pre>
            ) : null}
        </div>
    );
}

export default TacticalGameCreation;