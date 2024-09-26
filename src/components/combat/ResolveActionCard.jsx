import React, { useContext } from "react";
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { CombatContext } from './CombatProvider';

import { API_TACTICAL_URL } from '../../constants/environment';

const ResolveActionCard = ({ action }) => {

    const { t, i18n } = useTranslation();

    const { roundActions, setRoundActions } = useContext(CombatContext);

    const handleDeleteActionClick = async () => {
        try {
            const response = await fetch(`${API_TACTICAL_URL}/actions/${action.id}`, { method: "DELETE" });
            const deleteResponse = await response;
            if (deleteResponse.status == 204) {
                const newActionList = roundActions.filter(e => e.id !== action.id);
                setRoundActions(newActionList);
            } else {
                //TODO display error
                console.log("delete data: " + deleteResponse.status);
            }
        } catch (error) {
            console.log("delete error: " + error);
        }
    };

    const getImage = () => {
        switch (action.type) {
            case 'attack': return '/static/images/actions/attack.png';
            //TODO
            default: return '/static/images/movement.jpg';
        }
    }

    if (!action) {
        return <p>Loading...</p>
    }

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Avatar alt="Remy Sharp" src='/static/images/actions/attack.png' />
                <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                    Action points: {action.actionPoints}
                </Typography>
                <Typography variant="h5" component="div">
                    {t(`action-type-${action.type}`)}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small">Resolve</Button>
                <Button size="small" onClick={() => handleDeleteActionClick()}>Delete</Button>
            </CardActions>
        </Card>
    );
}

export default ResolveActionCard;
