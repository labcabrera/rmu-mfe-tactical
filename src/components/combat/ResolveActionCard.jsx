import React, { useContext } from "react";
import { useTranslation } from 'react-i18next';

import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import Avatar from '@mui/material/Avatar';
import IconButton from "@mui/material/IconButton";
import Typography from '@mui/material/Typography';

import DeleteButton from "../button/DeleteButton";

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

    if (!action) {
        return <p>Loading...</p>
    }

    return (
        <>
            <Avatar alt="Remy Sharp" src={`/static/images/actions/${action.type}.png`} />
            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                Action points: {action.actionPoints}
            </Typography>
            <IconButton size="small">
                <MiscellaneousServicesIcon />
            </IconButton>
            <DeleteButton onClick={() => handleDeleteActionClick()} size={40} />
        </>
    );
}

export default ResolveActionCard;
