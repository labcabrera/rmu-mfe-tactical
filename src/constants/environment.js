const API_CORE_URL = process.env.API_CORE_URL || "http://localhost:3001/v1";
const API_STRATEGIC_URL = process.env.API_STRATEGIC_URL || "http://localhost:3002/v1";
const API_TACTICAL_URL = process.env.API_TACTICAL_URL || "http://localhost:3003/v1";
const API_ITEMS_URL = process.env.API_ITEMS_URL || "http://localhost:3006/v1";
const API_NPC_NAMES_URL = process.env.API_ITEMS_URL || "http://localhost:3007/v1";

export {
    API_CORE_URL,
    API_STRATEGIC_URL,
    API_TACTICAL_URL,
    API_ITEMS_URL,
    API_NPC_NAMES_URL
};
