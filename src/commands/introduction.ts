//-Path: "Choco-Developer-Bot/src/commands/introduction.ts"
import {
    Message,
    EmbedBuilder,
    ComponentType,
    OmitPartialGroupDMChannel,
} from "discord.js";
import Room from "../data/room";
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
    if (!Room.INTRODUCTION_CHANNEL_ID.includes(message.channel.id)) return;
    if (!message.content.includes("สวัสดี")) return;

    // ลบข้อความ "สวัสดี" ของผู้ใช้
    await message.delete().catch(() => {});

    const modeEmbed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("👋 เลือกรูปแบบการแนะนำตัว")
        .setDescription(
            `สวัสดีครับ **${message.author.username}**! คุณต้องการแนะนำตัวแบบไหน?\n\n` +
                "📑 **ตอบทีละคำถาม:** ระบบจะถามคำถามคุณทีละข้อ\n" +
                "📝 **ตอบแบบอิสระ:** ตอบทุกคำถามในครั้งเดียวได้อย่างอิสระ",
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
            await startStepByStep(message);
        }

        if (interaction.customId === "custom") {
            modeCollector.stop();
            await modeMessage.delete().catch(() => {});
            await startCustomMode(message);
        }
    });

    modeCollector.on("end", (collected, reason) => {
        if (reason === "time" && collected.size === 0) {
            modeMessage.delete().catch(() => {});
        }
    });
}
