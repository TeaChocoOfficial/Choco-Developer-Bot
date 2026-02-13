//-Path: "Choco-Developer-Bot/src/handlers/mention.ts"
import { Message } from "discord.js";

/**
 * จัดการเมื่อมีการกล่าวถึงบอท (@mention)
 * @param message - ออบเจ็กต์ข้อความที่ได้รับ
 */
export const handleMention = (message: Message) => {
    if (message.author.bot || !message.mentions.has(message.client.user!.id))
        return;

    const greetings = [
        `สวัสดีครับคุณ ${message.author}! มีอะไรให้ผมช่วยไหมครับ? ✨`,
        `สวัสดีครับ! ผม Choco Developer Bot พร้อมให้บริการแล้วครับ 🍫`,
        `เรียกผมเหรอครับคุณ ${message.author}? ยินดีที่ได้รู้จักครับ!`,
    ];
    const randomGreeting =
        greetings[Math.floor(Math.random() * greetings.length)];

    message.reply(randomGreeting);
};
