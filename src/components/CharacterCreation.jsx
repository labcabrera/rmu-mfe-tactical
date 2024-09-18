import React, { useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const CharacterCreation = () => {

    // const location = useLocation();
    // const game = location.state?.game;

    const [formData, setFormData] = useState({
        name: '',
        tacticalGameId: 'test',
        info: {
            level: 1,
            race: "ork",
            size: "medium",
            armorType: 1
        },
        description: ''
    });

    const handleSubmit = (e) => {
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    };

    const handleInfoChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevState) => ({
            ...prevState,
            info: {
                ...prevState.info,
                [name]: value
            }
        }));
    };

    return (
        <div>
            <div>
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
                        label="Level"
                        variant="outlined"
                        fullWidth
                        name="level"
                        value={formData.info.level}
                        onChange={handleInfoChange}
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
                    <Button type="submit" variant="outlined" color="primary">Create</Button>
                </form>
            </div>
            {/* <pre>
                {JSON.stringify(game, null, 2)}
            </pre> */}
            <pre>
                {JSON.stringify(formData, null, 2)}
            </pre>
        </div>
    );
}

export default CharacterCreation;