// -Path: "Choco-Developer-Bot/src/data/room.ts"

namespace Room {
    export type Type = {
        id: string;
        name: string;
    };
    export const WELCOME_CHANNEL: Type = {
        id: "1452475087780446292",
        name: "🏠ยินดีต้อนรับ-welcome",
    };
    export const INTRODUCTION_CHANNEL: Type = {
        id: "1452600034737655949",
        name: "🤝แนะนำตัวเอง-introductions",
    };
    export const LIST_OF_LOST_PEOPLE_CHANNEL: Type = {
        id: "1471818198231023760",
        name: "🪪รายชื่อคนหลงทาง-list-of-lost-people",
    };
    export const BOT_TESTING_CHANNEL: Type = {
        id: "1467794839360897095",
        name: "🤖ทดสอบบอท-bot-testing",
    };
}

export default Room;
