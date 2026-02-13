//-Path: "Choco-Developer-Bot/src/commands/introduction.ts"
import {
    Message,
    EmbedBuilder,
    ComponentType,
    OmitPartialGroupDMChannel,
} from "discord.js";
import Room from "../data/room";
import Introduction from "../models/Introduction";
import { createModeButtons } from "./introduction/buttons";
import { startCustomMode, startStepByStep } from "./introduction/flows";

/**
 * เริ่มกระบวนการแนะนำตัว (Entry Point)
 * @param message - ข้อความที่ส่งมา
 */
export async function handleIntroduction(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
) {
    if (!message.guild || !message.member) return;
    if (
        ![Room.INTRODUCTION_CHANNEL.id, Room.BOT_TESTING_CHANNEL.id].includes(
            message.channel.id,
        )
    )
        return;
    if (!message.content.includes("สวัสดี")) return;

    // ลบข้อความ "สวัสดี" ของผู้ใช้
    await message.delete().catch(() => {});

    const existingData = await Introduction.findOne({
        discordId: message.author.id,
    });
    const isEdit = !!existingData;

    const modeEmbed = new EmbedBuilder()
        .setColor(isEdit ? 0xe67e22 : 0x3498db)
        .setTitle(
            isEdit ? "✏️ แก้ไขข้อมูลการแนะนำตัว" : "👋 เลือกรูปแบบการแนะนำตัว",
        )
        .setDescription(
            `สวัสดีครับ **${message.author.username}**! ${isEdit ? "คุณต้องการแก้ไขข้อมูลในรูปแบบไหน?" : "คุณต้องการแนะนำตัวแบบไหน?"}\n\n` +
                "📑 **ตอบทีละคำถาม:** " +
                (isEdit ? "แก้ไขข้อมูลทีละข้อ" : "ระบบจะถามคำถามคุณทีละข้อ") +
                "\n" +
                "📝 **ตอบแบบอิสระ:** " +
                (isEdit ?
                    "แก้ไขข้อมูลทั้งหมดในครั้งเดียว"
                :   "ตอบทุกคำถามในครั้งเดียวได้อย่างอิสระ"),
        );

    const modeMessage = await message.channel.send({
        content: `<@${message.author.id}>`,
        embeds: [modeEmbed],
        components: [createModeButtons()],
    });

    const modeCollector = modeMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (interaction) => interaction.user.id === message.author.id,
        time: 60000,
    });

    modeCollector.on("collect", async (interaction) => {
        await interaction.deferUpdate();

        if (interaction.customId === "cancel") {
            modeCollector.stop();
            await modeMessage.delete().catch(() => {});
            return;
        }

        if (interaction.customId === "step") {
            modeCollector.stop();
            await modeMessage.delete().catch(() => {});
            await startStepByStep(message, existingData as any);
        }

        if (interaction.customId === "custom") {
            modeCollector.stop();
            await modeMessage.delete().catch(() => {});
            await startCustomMode(message, existingData as any);
        }
    });

    modeCollector.on("end", (collected, reason) => {
        if (reason === "time" && collected.size === 0) {
            modeMessage.delete().catch(() => {});
        }
    });
}
