//-Path: "Choco-Developer-Bot/src/commands/admin/embed.ts"
import { Message, EmbedBuilder, ColorResolvable } from "discord.js";

/**
 * คำสั่งสร้าง Embed สำหรับแอดมิน (แบบละเอียดและยืดหยุ่น)
 * รูปแบบ: embed ch: #ห้อง | t: หัวข้อ | d: รายละเอียด | c: สี | i: รูปขยาย | th: รูปเล็ก | f: ท้าย | a: คนเขียน
 * @param message - ข้อความที่ส่งมา
 */
export async function embed(message: Message<boolean>) {
    if (!message.content.startsWith("embed")) return;

    const content = message.content.replace(/^embed\s*/, "").trim();

    if (!content) {
        const helpEmbed = new EmbedBuilder()
            .setTitle("📖 วิธีใช้งานคำสั่ง Embed")
            .setColor(0x3498db)
            .setDescription(
                "คุณสามารถสร้าง Embed ได้โดยใช้แฟลก (Dash Flags) ดังนี้:\n" +
                    "`embed -ch #ห้อง -tt หัวข้อ -d รายละเอียด -c สี -i รูปใหญ่ -th รูปเล็ก -f ท้าย -a คนเขียน`\n\n" +
                    "**แฟลกที่ใช้งานได้:**\n" +
                    "• `-ch` : ระบุห้องที่จะส่ง\n" +
                    "• `-tt` : ชื่อหัวข้อ\n" +
                    "• `-d`  : รายละเอียดข้อความ\n" +
                    "• `-c`  : สี (เช่น `Blue`, `#ff0000`)\n" +
                    "• `-i`  : ลิงก์รูปภาพขนาดใหญ่\n" +
                    "• `-th` : ลิงก์รูปภาพขนาดเล็ก\n" +
                    "• `-f`  : ข้อความส่วนท้าย\n" +
                    "• `-a`  : ชื่อผู้เขียน\n" +
                    "• `-ts` : แสดงเวลาที่ส่ง (Timestamp)\n" +
                    "• `-tag`: แท็กคนหรือยศ (เช่น `@everyone`, `@Role`)\n\n" +
                    "*หมายเหตุ: พิมพ์สลับส่วนไหนก็ได้ และไม่จำเป็นต้องใส่ครบทุกอัน*",
            );

        const response = await message.reply({ embeds: [helpEmbed] });
        setTimeout(() => response.delete().catch(() => {}), 60000);
        return;
    }

    let mentionContent: string | undefined;
    let targetChannel = message.channel;
    const embedBuilder = new EmbedBuilder();
    const flags =
        "channel|ch|title|tt|desc|d|color|c|image|i|thumb|th|footer|f|author|a|timestamp|ts|tag";
    const regex = new RegExp(
        `-(${flags})\\s*([\\s\\S]*?)(?=\\s-(?:${flags})\\s|$)`,
        "gi",
    );
    let match;
    let hasFlag = false;

    while ((match = regex.exec(content + " ")) !== null) {
        const key = match[1].toLowerCase();
        const value = match[2].trim().replace(/\\n/g, "\n");
        hasFlag = true;

        if (key === "channel" || key === "ch") {
            if (!value) continue;
            const channelId = value.replace(/[<#>]/g, "");
            const channel = message.guild?.channels.cache.get(channelId);
            if (channel?.isTextBased()) targetChannel = channel;
        } else if (key === "title" || key === "tt") {
            if (value) embedBuilder.setTitle(value);
        } else if (key === "desc" || key === "d") {
            if (!value) continue;
            const currentDesc = embedBuilder.data.description || "";
            embedBuilder.setDescription(
                currentDesc ? `${currentDesc}\n${value}` : value,
            );
        } else if (key === "color" || key === "c") {
            if (value) embedBuilder.setColor(value as ColorResolvable);
        } else if (key === "image" || key === "i") {
            if (value) embedBuilder.setImage(value);
        } else if (key === "thumb" || key === "th") {
            if (value) embedBuilder.setThumbnail(value);
        } else if (key === "footer" || key === "f") {
            if (value) embedBuilder.setFooter({ text: value });
        } else if (key === "author" || key === "a") {
            if (value) embedBuilder.setAuthor({ name: value });
        } else if (key === "timestamp" || key === "ts")
            embedBuilder.setTimestamp();
        else if (key === "tag") {
            if (value) mentionContent = value;
        }
    }

    if (!hasFlag) embedBuilder.setDescription(content);
    if (!("send" in targetChannel)) return;

    await targetChannel.send({
        content: mentionContent,
        embeds: [embedBuilder.setColor(embedBuilder.data.color || 0x2ecc71)],
    });
    await message.delete().catch(() => {});
}
