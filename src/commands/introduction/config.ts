//-Path: "Choco-Developer-Bot/src/commands/introduction/config.ts"
import { Question } from "./types";

/**
 * รายการคำถามสำหรับการแนะนำตัว
 */
export const questions: Question[] = [
    { key: "name", label: "ชื่อ", required: true, emoji: "👤" },
    { key: "gender", label: "เพศ", required: false, emoji: "🚻" },
    { key: "birthday", label: "วันเกิด", required: false, emoji: "🎂" },
    { key: "age", label: "อายุ", required: false, emoji: "🔢" },
    { key: "address", label: "ที่อยู่", required: false, emoji: "📍" },
    { key: "hobbies", label: "งานอดิเรก", required: false, emoji: "🎮" },
    { key: "works", label: "งานประจำ", required: false, emoji: "💼" },
    {
        key: "portfolio",
        label: "ผลงาน (Github/Portfolio)",
        required: false,
        emoji: "🔗",
    },
    {
        key: "additionalInfo",
        label: "รายละเอียดเพิ่มเติม",
        required: false,
        emoji: "📝",
    },
];
