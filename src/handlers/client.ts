//-Path: "Choco-Developer-Bot/src/handlers/client.ts"
import { handleMention } from "./mention";
import { Client, Events } from "discord.js";
import { handleRPS } from "../commands/rps";
import { handleInfo } from "../commands/info";
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
        handleMention(message);
        adminMessageCreate(message);
        handleIntroduction(message);
        handleInfo(message);
        handleRPS(message);
    });
};
