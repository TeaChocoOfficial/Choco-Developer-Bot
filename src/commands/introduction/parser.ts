//-Path: "Choco-Developer-Bot/src/commands/introduction/parser.ts"
import { IIntroduction } from "../../models/Introduction";

/**
 * วิเคราะห์ข้อความแบบ Custom เพื่อดึงข้อมูลตามเทมเพลต
 * @param content - ข้อความที่ผู้ใช้ส่งมา
 * @returns IIntroduction
 */
export function parseCustomIntroduction(
    content: string,
): Partial<IIntroduction> {
    const data: Partial<IIntroduction> = {};
    const cleanText = content
        .replace(/```[\s\S]*?```/g, "")
        .replace(/[*_`]/g, "")
        .trim();

    const fieldConfigs = [
        { key: "age", keywords: ["อายุ"] },
        { key: "gender", keywords: ["เพศ"] },
        { key: "address", keywords: ["ที่อยู่"] },
        { key: "birthday", keywords: ["วันเกิด"] },
        { key: "name", keywords: ["ชื่อ", "เรียก", "นาม"] },
        { key: "hobbies", keywords: ["งานอดิเรก", "ชอบทำ", "กิจกรรม"] },
        { key: "works", keywords: ["การศึกษา", "งานประจำ", "อาชีพ", "ทำงาน"] },
        {
            key: "portfolio",
            keywords: ["ผลงาน", "Portfolio", "Github", "ลิ้ง"],
        },
        {
            key: "additionalInfo",
            keywords: ["เป้าหมาย", "รายละเอียดเพิ่มเติม", "อื่นๆ", "ฝากตัว"],
        },
    ];

    const allKeywords = fieldConfigs
        .flatMap((config) => config.keywords)
        .sort((first, second) => second.length - first.length);

    const escapedKeywords = allKeywords
        .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
    const delimiterRegExp = new RegExp(`(?:${escapedKeywords})`, "i");

    for (const config of fieldConfigs) {
        for (const keyword of config.keywords) {
            const regex = new RegExp(
                `${keyword}[\\s:：]*([\\s\\S]*?)(?=${delimiterRegExp.source}|$)`,
                "i",
            );
            const match = cleanText.match(regex);

            if (match && match[1]?.trim()) {
                let value = match[1].trim();

                value = value
                    .replace(/^เช่น\s*/i, "")
                    .replace(/\(จำเป็น\)/g, "")
                    .trim();

                if (value && !value.includes("(เช่น")) {
                    (data as any)[config.key] = value;
                    break;
                }
            }
        }
    }

    return data;
}
