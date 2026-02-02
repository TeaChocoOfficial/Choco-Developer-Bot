//-Path: "Choco-Developer-Bot/src/handlers/memberJoin.ts"
import Role from "../data/role";
import { Client, Events, GuildMember } from "discord.js";

/**
 * ฟังก์ชันจัดการเมื่อสมาชิกใหม่เข้าร่วมเซิร์ฟเวอร์
 * @param client - ออบเจ็กต์บอทหลัก
 */
export const setupMemberJoinHandler = (client: Client) => {
    client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
        const lostPersonRole = member.guild.roles.cache.find(
            (role) => role.id === Role.LOST_PERSON.id,
        );

        if (lostPersonRole) {
            try {
                await member.roles.add(lostPersonRole);
                console.log(
                    `Assigned ${Role.LOST_PERSON.name} role to ${member.user.tag}`,
                );
            } catch (error) {
                console.error(
                    `Failed to assign role to ${member.user.tag}:`,
                    error,
                );
            }
        }
    });
};
