//-Path: "Choco-Developer-Bot/src/handlers/client.ts"
import { Client, Events } from "discord.js";
import { adminMessageCreate } from "../commands/admin/admin";
import { handleIntroduction } from "../commands/introduction";

/**
 * ฟังก์ชันเริ่มต้นสำหรับจัดการเหตุการณ์ของ Client
 * @param client - ออบเจ็กต์บอทหลัก
 */
export const ready = (client: Client) => {
    client.once(Events.ClientReady, (readyClient) =>
        console.log(`🤖 Ready! Logged in as ${readyClient.user.tag}`),
    );

    client.on(Events.MessageCreate, (message) => {
        if (message.author.bot) return;
        adminMessageCreate(message);
        handleIntroduction(message);
    });
};
