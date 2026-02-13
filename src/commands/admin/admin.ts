//-Path: "Choco-Developer-Bot/src/commands/admin/admin.ts"
import {
    Message,
    PermissionFlagsBits,
    OmitPartialGroupDMChannel,
} from "discord.js";
import { clear } from "./clear";
import { embed } from "./embed";

/**
 * จัดการคำสั่งสำหรับผู้ดูแลระบบ
 * @param message - ข้อความที่ส่งมา
 */
export async function adminMessageCreate(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
) {
    const isAdmin = message.member?.permissions.has(
        PermissionFlagsBits.Administrator,
    );
    if (!isAdmin) return;

    if (message.content === "admin") {
        message.reply("Admin");
    }
    clear(message);
    embed(message);
}
