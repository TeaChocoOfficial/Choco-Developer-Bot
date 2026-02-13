//-Path: "Choco-Developer-Bot/src/index.ts"
import "dotenv/config";
import express from "express";
import { ready } from "./handlers/client";
import { connectDatabase } from "./handlers/database";
import { setupMemberJoinHandler } from "./handlers/memberJoin";
import { Client, GatewayIntentBits, Partials } from "discord.js";

const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Channel, Partials.Message], // สำหรับ DM
});
const port = process.env.PORT || 3000;
const token = process.env.DISCORD_TOKEN;

/**
 * เริ่มการทำงานของบอทพร้อมระบบรันใหม่อัตโนมัติเมื่อเกิดข้อผิดพลาด
 */
const initialize = async () => {
    console.log("⚡ Starting bot initialization...");

    try {
        await connectDatabase();
        await client.login(token);
        console.log("✅ Success: client.login() resolved");
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

app.get("/", (request, response) =>
    response.json({
        status: "online",
        time: new Date().toISOString(),
        bot: client.isReady() ? "connected" : "disconnected",
    }),
);
app.listen(port, () => console.log(`🚀 Express is listening on port ${port}`));

ready(client);
setupMemberJoinHandler(client);
initialize();
