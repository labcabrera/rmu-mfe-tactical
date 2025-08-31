import React from "react";

import Avatar from "@mui/material/Avatar";

const CharacterAvatar = ({ character, size = 80, variant }) => {

    return (
        <Avatar
            alt={character.name}
            variant={variant}
            sx={{ width: size, height: size }}
            src={`/static/images/races/${character.info.race}.png`} />
    );
}

export default CharacterAvatar;