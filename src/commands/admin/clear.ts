// -Path: "Choco-Developer-Bot/src/commands/admin/clear.ts"
import Room from "../../data/room";
import { Message } from "discord.js";

export async function clear(message: Message<boolean>) {
    if (
        ["cls", "clear"].includes(message.content) &&
        Room.BOT_TESTING_CHANNEL_ID.includes(message.channel.id)
    ) {
        if (
            !message.channel.isTextBased() ||
            !("bulkDelete" in message.channel)
        )
            return;

        try {
            const deleted = await message.channel.bulkDelete(100, true);
            const response = await message.channel.send(
                `🧹 ลบข้อความเรียบร้อยแล้ว ${deleted.size} ข้อความ! (ไม่รวมข้อความที่เก่าเกิน 14 วัน)`,
            );

            setTimeout(() => response.delete().catch(() => {}), 5000);
        } catch (error) {
            console.error("Failed to clear messages:", error);
            message.reply("❌ เกิดข้อผิดพลาดในการลบข้อความครับ");
        }
    }
}
