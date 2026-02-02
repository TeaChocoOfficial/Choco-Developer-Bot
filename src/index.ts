//-Path: "Choco-Developer-Bot/src/index.ts"
import "dotenv/config";
import { ready } from "./handlers/client";
import { connectDatabase } from "./handlers/database";
import { Client, GatewayIntentBits } from "discord.js";
import { setupMemberJoinHandler } from "./handlers/memberJoin";

const token = process.env.DISCORD_TOKEN;
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

/**
 * เริ่มการทำงานของบอทพร้อมระบบรันใหม่อัตโนมัติเมื่อเกิดข้อผิดพลาด
 */
const initialize = async () => {
    try {
        await connectDatabase();
        ready(client);
        setupMemberJoinHandler(client);
        await client.login(token);
    } catch (error) {
        console.error("❌ Bot Error:", error);
        console.log("🔄 กำลังรีสตาร์ทใน 5 วินาที...");
        setTimeout(initialize, 5000);
    }
};

process.on("unhandledRejection", (error) =>
    console.error("Unhandled Rejection:", error),
);
process.on("uncaughtException", (error) =>
    console.error("Uncaught Exception:", error),
);

initialize();
