//-Path: "Choco-Developer-Bot/src/commands/introduction/buttons.ts"
import { questions } from "./config";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

/**
 * สร้างปุ่มสำหรับ Embed
 * @param questionIndex - ลำดับคำถาม
 * @param showSummary - แสดงปุ่มกลับหน้ายืนยันหรือไม่
 * @returns ActionRowBuilder
 */
export function createButtons(
    questionIndex: number,
    showSummary: boolean = false,
) {
    const buttons: ButtonBuilder[] = [];
    const question = questions[questionIndex];

    if (questionIndex > 0) {
        buttons.push(
            new ButtonBuilder()
                .setCustomId("back")
                .setLabel("ย้อนกลับ")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("⬅️"),
        );
    }

    if (question && !question.required) {
        buttons.push(
            new ButtonBuilder()
                .setCustomId("skip")
                .setLabel("ไม่ระบุ")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("⏭️"),
        );
    }

    if (showSummary) {
        buttons.push(
            new ButtonBuilder()
                .setCustomId("summary")
                .setLabel("กลับหน้ายืนยัน")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("🔍"),
        );
    }

    buttons.push(
        new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("ยกเลิก")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("❌"),
    );

    return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}

/**
 * สร้างปุ่มเลือกโหมดการแนะนำตัว
 * @returns ActionRowBuilder
 */
export function createModeButtons() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
            .setCustomId("step")
            .setLabel("ตอบทีละคำถาม")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📑"),
        new ButtonBuilder()
            .setCustomId("custom")
            .setLabel("ตอบแบบอิสระ")
            .setStyle(ButtonStyle.Success)
            .setEmoji("📝"),
        new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("ยกเลิก")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("❌"),
    ]);
}

/**
 * สร้างปุ่มยืนยันข้อมูล
 * @param showStepEdit - แสดงปุ่มตรวจทีละข้อหรือไม่
 * @returns ActionRowBuilder
 */
export function createConfirmButtons(showStepEdit: boolean = false) {
    const buttons = [
        new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("ถัดไป")
            .setStyle(ButtonStyle.Success)
            .setEmoji("➡️"),
        new ButtonBuilder()
            .setCustomId("edit")
            .setLabel("แก้เฉพาะจุด")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("✏️"),
    ];

    if (showStepEdit) {
        buttons.push(
            new ButtonBuilder()
                .setCustomId("edit_step")
                .setLabel("ตรวจทีละข้อ")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("📋"),
        );
    }

    buttons.push(
        new ButtonBuilder()
            .setCustomId("restart")
            .setLabel("เริ่มใหม่")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🔄"),
        new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("ยกเลิก")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("❌"),
    );

    return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}

/**
 * สร้างปุ่มเลือกรูปแบบการแสดงผล
 * @returns ActionRowBuilder
 */
export function createDisplayChoiceButtons() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
            .setCustomId("display_list")
            .setLabel("แสดงเป็นลิสต์ (สวยงาม)")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📑"),
        new ButtonBuilder()
            .setCustomId("display_raw")
            .setLabel("แสดงตามที่ฉันพิมพ์")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("📝"),
    ]);
}

/**
 * สร้างปุ่มเลือกฟิลด์ที่ต้องการแก้ไข
 * @returns ActionRowBuilder[]
 */
export function createEditFieldButtons() {
    const rows = [];
    const chunks = [];

    for (let index = 0; index < questions.length; index += 5) {
        chunks.push(questions.slice(index, index + 5));
    }

    for (const chunk of chunks) {
        const buttons = chunk.map((question) =>
            new ButtonBuilder()
                .setCustomId(`edit_${question.key}`)
                .setLabel(question.label)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(question.emoji),
        );
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons));
    }

    return rows;
}
