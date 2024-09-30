import React from "react";

import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';

const CharacterListItemAvatar = ({ character }) => {

    return (
        <ListItemAvatar>
            <Avatar src={`/static/images/races/${character.info.race}.jpg`} />
        </ListItemAvatar>
    );
}

export default CharacterListItemAvatar;