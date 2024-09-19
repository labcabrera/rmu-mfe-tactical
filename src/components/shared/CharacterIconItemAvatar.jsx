import React from "react";

import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import caveTrollIcon from '../../assets/images/races/lotr-cave-troll.jpg';
import gondorIcon from '../../assets/images/races/lotr-gondor.jpg';
import orcIcon from '../../assets/images/races/lotr-orc.jpg';
import witchKingIcon from '../../assets/images/races/lotr-witch-king.jpg';

const CharacterListItemAvatar = ({ character }) => {

    const resolveAvatarImage = () => {
        switch (character.info.race) {
            case 'lotr-human': return gondorIcon;
            case 'lotr-orc': return orcIcon;
            case 'lotr-troll': return caveTrollIcon;
            default: return witchKingIcon;
        }
    };

    return (
        <ListItemAvatar>
            <Avatar src={resolveAvatarImage()} />
        </ListItemAvatar>
    );
}

export default CharacterListItemAvatar;