//-Path: "Choco-Developer-Bot/src/handlers/memberJoin.ts"
import Role from "../data/role";
import Room from "../data/room";
import Introduction from "../models/Introduction";
import { Client, Events, GuildMember, EmbedBuilder } from "discord.js";

/**
 * ฟังก์ชันจัดการเมื่อสมาชิกใหม่เข้าร่วมเซิร์ฟเวอร์
 * @param client - ออบเจ็กต์บอทหลัก
 */
export const setupMemberJoinHandler = (client: Client) => {
    client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
        const welcomeChannelId = Room.WELCOME_CHANNEL.id;
        const introChannelId = Room.INTRODUCTION_CHANNEL.id;
        const welcomeChannel =
            member.guild.channels.cache.get(welcomeChannelId);
        const lostPersonRole = member.guild.roles.cache.find(
            (role) => role.id === Role.LOST_PERSON.id,
        );

        const existingData = await Introduction.findOne({
            discordId: member.id,
        });
        const isEdit = !!existingData;

        if (isEdit && lostPersonRole) {
            try {
                await member.roles.add(lostPersonRole);
                console.log(
                    `Restored ${Role.LOST_PERSON.name} role to re-joining member ${member.user.tag}`,
                );
            } catch (error) {
                console.error(
                    `Failed to assign role to ${member.user.tag}:`,
                    error,
                );
            }
        }

        if (welcomeChannel?.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle("🍦 ยินดีต้อนรับสู่ Choco Developer!")
                .setColor(0xff66ee)
                .setThumbnail(member.user.displayAvatarURL())
                .setDescription(
                    `สวัสดีครับคุณ ${member}! ยินดีต้อนรับเข้าสู่เซิร์ฟเวอร์ครับ ✨\n\n` +
                        "**ขั้นตอนการเริ่มต้น:**\n" +
                        `1. กรุณาแนะนำตัวที่ห้อง <#${introChannelId}>\n` +
                        "2. เมื่อแนะนำตัวเสร็จ คุณจะได้รับยศเพื่อเข้าถึงห้องอื่นๆ\n\n" +
                        "ขอให้สนุกกับการพัฒนาซอฟต์แวร์ไปด้วยกันนะ! 🍫",
                );

            welcomeChannel.send({
                content: `ยินดีต้อนรับครับ ${member}!`,
                embeds: [embed],
            });
        }
    });

    client.on(Events.GuildMemberRemove, async (member) => {
        console.log(`User ${member.user?.tag || member.id} left the server.`);
        const welcomeChannelId = Room.WELCOME_CHANNEL.id;
        const welcomeChannel =
            member.guild.channels.cache.get(welcomeChannelId);

        if (welcomeChannel?.isTextBased()) {
            const userTag = member.user?.tag || "Unknown User";
            const avatarUrl =
                member.user?.displayAvatarURL() || member.guild.iconURL() || "";

            const embed = new EmbedBuilder()
                .setTitle("🍦 ลาก่อน Choco Developer!")
                .setColor(0xe74c3c)
                .setThumbnail(avatarUrl)
                .setDescription(
                    `คุณ **${userTag}** ได้ออกจากเซิร์ฟเวอร์ไปแล้วครับ 🍫✨\n` +
                        "หวังว่าเราจะได้พบกันใหม่ในโอกาสหน้านะครับ!",
                );

            welcomeChannel.send({ embeds: [embed] });
        }
    });
};
