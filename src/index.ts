//-Path: "Choco-Developer-Bot/src/index.ts"
import "dotenv/config";
import express from "express";
import { ready } from "./handlers/client";
import { connectDatabase } from "./handlers/database";
import { Client, GatewayIntentBits } from "discord.js";
import { setupMemberJoinHandler } from "./handlers/memberJoin";

const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});
const port = process.env.PORT || 3000;
const token = process.env.DISCORD_TOKEN;

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

app.get("/", (request, response) => response.send("Bot is running!"));
app.listen(port, () => console.log(`🚀 Express is listening on port ${port}`));

initialize();
