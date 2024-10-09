import React from "react";

import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';

const CharacterListItemAvatar = ({ character, variant = 'circle' }) => {

    return (
        <ListItemAvatar>
            <Avatar src={`/static/images/races/${character.info.race}.png`} variant={variant} />
        </ListItemAvatar>
    );
}

export default CharacterListItemAvatar;