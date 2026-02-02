//-Path: "Choco-Developer-Bot/src/commands/introduction/embeds.ts"
import { EmbedBuilder, User, Guild } from "discord.js";
import { IIntroduction } from "../../models/Introduction";
import { questions } from "./config";

/**
 * ตัดเครื่องหมายข้อความหากยาวเกินกำหนด
 * @param text - ข้อความ
 * @param limit - จำนวนตัวอักษรสูงสุด
 * @returns string
 */
function truncate(text: string, limit: number): string {
    return text.length > limit ? text.substring(0, limit - 3) + "..." : text;
}

/**
 * สร้าง Embed สำหรับถามคำถาม
 * @param questionIndex - ลำดับคำถาม
 * @param totalQuestions - จำนวนคำถามทั้งหมด
 * @param data - ข้อมูลปัจจุบัน
 * @param isEdit - โหมดแก้ไขหรือไม่
 * @returns EmbedBuilder
 */
export function createQuestionEmbed(
    questionIndex: number,
    totalQuestions: number,
    data: IIntroduction,
    isEdit: boolean = false,
) {
    const question = questions[questionIndex];
    if (!question) return null;

    const progressList = questions
        .map((item, itemIndex) => {
            let status = "⚪";
            const value = data[item.key];

            if (itemIndex < questionIndex) {
                status = value ? "✅" : "⏩";
            } else if (itemIndex === questionIndex) {
                status = "➡️";
            } else if (value) {
                status = "✅";
            }

            const label =
                value ?
                    `${item.label}: ${truncate(String(value), 50)}`
                :   item.label;
            return `${status} ${item.emoji} ${label}`;
        })
        .join("\n");

    const embed = new EmbedBuilder()
        .setColor(
            isEdit ? 0xe67e22
            : question.required ? 0xff6b6b
            : 0x4ecdc4,
        )
        .setTitle(
            isEdit ?
                `✏️ แก้ไข: ${question.label}`
            :   `${question.emoji} ${question.label}`,
        )
        .setDescription(
            `**ความคืบหน้า:**\n${progressList}\n\n` +
                (isEdit ? `กรุณาพิมพ์ข้อมูลใหม่สำหรับ **${question.label}**`
                : question.required ? `กรุณาพิมพ์คำตอบของคุณ (จำเป็น)`
                : `กรุณาพิมพ์คำตอบของคุณ หรือกดปุ่ม **ไม่ระบุ** ด้านล่าง`),
        )
        .setFooter({ text: `คำถาม ${questionIndex + 1}/${totalQuestions}` });

    return embed;
}

/**
 * สร้าง Embed สรุปข้อมูล
 * @param user - ข้อมูลผู้ใช้
 * @param guild - ข้อมูลเซิร์ฟเวอร์
 * @param data - ข้อมูลที่เก็บได้
 * @returns EmbedBuilder
 */
export function createSummaryEmbed(
    user: User,
    guild: Guild,
    data: IIntroduction,
) {
    const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setThumbnail(user.displayAvatarURL())
        .setTitle("✅ ข้อมูลการแนะนำตัว")
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL(),
        })
        .setFooter({
            text: guild.name,
            iconURL: guild.iconURL() || undefined,
        })
        .setTimestamp();

    if (data.displayType === "raw" && data.rawContent) {
        embed.setDescription(
            `ข้อมูลของ **${user.username}**\n\n${truncate(data.rawContent, 4000)}`,
        );
    } else {
        embed.setDescription(`ข้อมูลของ **${user.username}**`);
        for (const question of questions) {
            const value = (data as any)[question.key];
            if (value)
                embed.addFields({
                    name: `${question.emoji} ${question.label}`,
                    value: truncate(String(value), 1024),
                });
        }
    }

    return embed;
}
