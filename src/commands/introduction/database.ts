//-Path: "Choco-Developer-Bot/src/commands/introduction/database.ts"
import { Message, EmbedBuilder, OmitPartialGroupDMChannel } from "discord.js";
import Introduction, { IIntroduction } from "../../models/Introduction";
import { createSummaryEmbed } from "./embeds";
import Role from "../../data/role";

/**
 * บันทึกข้อมูลการแนะนำตัวลงฐานข้อมูล
 * @param data - ข้อมูลที่เก็บได้
 * @param message - ข้อความต้นทาง
 */
export async function saveIntroduction(
    data: IIntroduction,
    message: OmitPartialGroupDMChannel<Message<boolean>>,
) {
    if (!message.guild || !message.member) return;

    try {
        await Introduction.findOneAndUpdate(
            { discordId: message.author.id },
            {
                name: data.name,
                age: data.age || null,
                works: data.works || null,
                introducedAt: new Date(),
                gender: data.gender || null,
                username: message.author.username,
                address: data.address || null,
                hobbies: data.hobbies || null,
                birthday: data.birthday || null,
                discordId: message.author.id,
                rawContent: data.rawContent || null,
                displayType: data.displayType || "list",
                portfolio: data.portfolio || null,
                additionalInfo: data.additionalInfo || null,
            },
            { upsert: true, new: true },
        );

        const summaryEmbed = createSummaryEmbed(
            message.author,
            message.guild,
            data,
        );
        await message.channel.send({ embeds: [summaryEmbed] });

        const lostPersonRole = message.guild.roles.cache.get(
            Role.LOST_PERSON.id,
        );

        if (lostPersonRole) {
            await message.member.roles.add(lostPersonRole);

            const welcomeEmbed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle("🎉 ยินดีต้อนรับ!")
                .setDescription(
                    `ขอบคุณที่แนะนำตัว **${data.name}**!\n\n` +
                        `คุณได้รับการยืนยันตัวตนแล้ว สามารถเข้าห้องอื่นๆ ได้เลยครับ 🎊`,
                );

            const welcomeMessage = await message.channel.send({
                embeds: [welcomeEmbed],
            });
            setTimeout(() => welcomeMessage.delete().catch(() => {}), 5000);
        } else {
            const updateEmbed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle("📝 อัปเดตข้อมูลสำเร็จ")
                .setDescription(
                    `ข้อมูลการแนะนำตัวของ **${data.name}** ได้รับการอัปเดตแล้วครับ!`,
                );

            const updateMessage = await message.channel.send({
                embeds: [updateEmbed],
            });

            setTimeout(() => updateMessage.delete().catch(() => {}), 5000);
        }
    } catch (error) {
        console.error("Error saving introduction:", error);

        const errorEmbed = new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle("❌ เกิดข้อผิดพลาด")
            .setDescription(
                "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้งครับ",
            );
        await message.channel.send({ embeds: [errorEmbed] });
    }
}
