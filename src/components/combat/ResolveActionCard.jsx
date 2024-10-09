import React, { useContext } from "react";
import { useTranslation } from 'react-i18next';

import { Stack } from "@mui/material";
import IconButton from "@mui/material/IconButton";

import DeleteButton from "../button/DeleteButton";
import PlayButton from "../button/PlayButton";

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
        <Stack direction="row">
            <IconButton disabled
                style={{
                    width: `70px`,
                    height: `70px`,
                    opacity: 0.5
                }}
            >
                <img
                    src={`/static/images/actions/${action.type}.png`}
                    alt={action.type}
                    style={{ width: '100%', height: '100%', borderRadius: '50%' }} // Rounded image
                />
            </IconButton>
            <PlayButton size={70} />
            <DeleteButton onClick={() => handleDeleteActionClick()} size={70} />
        </Stack>
    );
}

export default ResolveActionCard;
