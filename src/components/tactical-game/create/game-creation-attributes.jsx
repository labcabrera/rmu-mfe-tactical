import { useTranslation } from 'react-i18next';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

const GameCreationAttributes = ({ formData, setFormData }) => {

    const { t } = useTranslation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    };

    const handleIntChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: parseInt(value) })
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    label={t('name')}
                    variant="outlined"
                    fullWidth
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    required />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Description"
                    variant="outlined"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    margin="normal" />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={t('fatigue-multiplier')}
                    variant="outlined"
                    name="fatigueMultiplier"
                    value={formData.fatigueMultiplier}
                    onChange={handleIntChange}
                    fullWidth
                    margin="normal" />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={t('board-scale')}
                    variant="outlined"
                    name="boardScale"
                    value={formData.boardScale}
                    onChange={handleIntChange}
                    fullWidth
                    margin="normal" />
            </Grid>

        </Grid>
    );

};

export default GameCreationAttributes;