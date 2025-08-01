const API_CORE_URL = process.env.RMU_API_CORE_URL || "http://api-core.rmu.local/v1";
const API_STRATEGIC_URL = process.env.RMU_API_STRATEGIC_URL || "http://api-strategic.rmu.local/v1";
const API_TACTICAL_URL = process.env.RMU_API_TACTICAL_URL || "http://api-tactical.rmu.local/v1";
const API_ATTACK_TABLES_URL = process.env.RMU_API_ATTACK_TABLES_URL || "http://api-attack-tables.rmu.local/v1";
const API_ITEMS_URL = process.env.RMU_API_ITEMS_URL || "http://api-items.rmu.local/v1";
const API_NPC_NAMES_URL = process.env.RMU_API_NPC_NAMES_URL || "http://api-npc-names.rmu.local/v1";

export {
    API_CORE_URL,
    API_STRATEGIC_URL,
    API_TACTICAL_URL,
    API_ATTACK_TABLES_URL,
    API_ITEMS_URL,
    API_NPC_NAMES_URL
};
