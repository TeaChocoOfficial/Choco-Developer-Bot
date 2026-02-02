// -Path: "Choco-Developer-Bot/src/commands/admin/embed.ts"
import Room from "../../data/room";
import { Message } from "discord.js";
import { EmbedBuilder } from "discord.js";

export async function embed(message: Message<boolean>) {
    if (
        message.content === "embed" &&
        Room.BOT_TESTING_CHANNEL_ID.includes(message.channel.id)
    ) {
        const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("🎉 ยินดีต้อนรับ!")
            .setDescription(
                `ขอบคุณที่แนะนำตัว **${message.author.username}**!\n\n` +
                    `คุณได้รับการยืนยันตัวตนแล้ว สามารถเข้าห้องอื่นๆ ได้เลยครับ 🎊`,
            );

        message.reply({ embeds: [embed] });
    }
}
