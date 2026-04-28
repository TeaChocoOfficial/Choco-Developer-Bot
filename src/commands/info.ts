//-Path: "Choco-Developer-Bot/src/commands/info.ts"
import Introduction from "../models/Introduction";
import { Message, EmbedBuilder, OmitPartialGroupDMChannel } from "discord.js";

/**
 * จัดการคำสั่ง info
 * @param message - ข้อความที่ส่งมา
 */
export async function handleInfo(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
) {
    if (!message.guild) return;

    // ตรวจสอบว่าข้อความขึ้นต้นด้วย "info" หรือไม่
    if (!message.content.trim().toLowerCase().startsWith("info")) return;

    // ตรวจสอบว่ามีการ mention user หรือไม่
    const mentionedUser = message.mentions.users.first();

    if (!mentionedUser) {
        // ถ้าไม่มีการ mention ให้แสดงวิธีใช้
        const usageEmbed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle("📋 วิธีใช้คำสั่ง info")
            .setDescription(
                "คำสั่ง `info` ใช้สำหรับดูข้อมูลของผู้ใช้ในเซิร์ฟเวอร์\n\n" +
                    "**รูปแบบการใช้งาน:**\n" +
                    "• `info @user` - ดูข้อมูลของผู้ใช้ที่ mention\n" +
                    "• `info` - แสดงวิธีใช้งาน (คำสั่งนี้)\n\n" +
                    "**ตัวอย่าง:**\n" +
                    "`info @ChocoDeveloper`",
            )
            .setTimestamp()
            .setFooter({
                text: `ร้องขอโดย ${message.author.username}`,
                iconURL: message.author.displayAvatarURL(),
            });

        await message.reply({ embeds: [usageEmbed] });
        return;
    }

    // ดึงข้อมูลสมาชิกในเซิร์ฟเวอร์
    const member = await message.guild.members
        .fetch(mentionedUser.id)
        .catch(() => null);

    // ดึงข้อมูลการแนะนำตัวจากฐานข้อมูล
    const introductionData = await Introduction.findOne({
        discordId: mentionedUser.id,
    });

    // สร้าง embed แสดงข้อมูลผู้ใช้
    const infoEmbed = new EmbedBuilder()
        .setColor(member?.displayHexColor || 0x3498db)
        .setTitle(`👤 ข้อมูลผู้ใช้: ${mentionedUser.username}`)
        .setThumbnail(mentionedUser.displayAvatarURL({ size: 256 }));

    // เพิ่มข้อมูล Bot หรือไม่
    if (mentionedUser.bot) {
        infoEmbed.addFields({
            name: "🤖 ประเภท",
            value: "บอท",
            inline: false,
        });
    }

    infoEmbed.addFields({
        name: "📅 วันที่สร้างบัญชี",
        value: `<t:${Math.floor(mentionedUser.createdTimestamp / 1000)}:F>`,
        inline: true,
    });

    // เพิ่มข้อมูลเฉพาะในเซิร์ฟเวอร์ (ถ้ามี)
    if (member) {
        infoEmbed.addFields({
            name: "📅 วันที่เข้าร่วมเซิร์ฟเวอร์",
            value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:F>`,
            inline: true,
        });
    }

    if (introductionData?.introducedAt) {
        infoEmbed.addFields({
            name: "📅 วันที่แนะนำตัว",
            value: `<t:${Math.floor(introductionData.introducedAt.getTime() / 1000)}:F>`,
            inline: true,
        });
    }

    // เพิ่มข้อมูลการแนะนำตัว (ถ้ามี)
    if (introductionData) {
        if (
            introductionData.displayType === "raw" &&
            introductionData.rawContent
        ) {
            // แสดงข้อมูลแบบ raw content
            const content = introductionData.rawContent;
            const maxLength = 1024;

            if (content.length <= maxLength) {
                // ถ้าข้อความสั้นพอ แสดงใน embed เดียว
                infoEmbed.addFields({
                    name: "📝 ข้อมูลการแนะนำตัว",
                    value: content,
                    inline: false,
                });
            } else {
                // ถ้าข้อความยาวเกินไป แบ่งเป็นหลาย embed
                const chunks = [];
                for (let i = 0; i < content.length; i += maxLength) {
                    chunks.push(content.substring(i, i + maxLength));
                }

                // แสดงส่วนแรกใน embed หลัก
                infoEmbed.addFields({
                    name: "📝 ข้อมูลการแนะนำตัว (1/" + chunks.length + ")",
                    value: chunks[0],
                    inline: false,
                });

                // ส่ง embed หลักก่อน
                await message.reply({ embeds: [infoEmbed] });

                // สร้างและส่ง embed เพิ่มเติมสำหรับส่วนที่เหลือ
                for (let i = 1; i < chunks.length; i++) {
                    const additionalEmbed = new EmbedBuilder()
                        .setColor(member?.displayHexColor || 0x3498db)
                        .setDescription(chunks[i]);

                    // เพิ่ม timestamp และ footer เฉพาะใน embed อันสุดท้าย
                    if (i === chunks.length - 1) {
                        additionalEmbed.setTimestamp().setFooter({
                            text: `ร้องขอโดย ${message.author.username}`,
                            iconURL: message.author.displayAvatarURL(),
                        });
                    }

                    await message.channel.send({ embeds: [additionalEmbed] });
                }

                return; // ออกจากฟังก์ชันเพื่อไม่ให้ส่ง embed หลักซ้ำ
            }
        } else {
            // แสดงข้อมูลแบบ list (default)
            infoEmbed.addFields({
                name: "📝 ข้อมูลการแนะนำตัว",
                value: "━━━━━━━━━━━━━━━━━━━━",
                inline: false,
            });

            if (introductionData.name) {
                infoEmbed.addFields({
                    name: "👤 ชื่อจริง",
                    value: introductionData.name,
                    inline: true,
                });
            }

            if (introductionData.age) {
                infoEmbed.addFields({
                    name: "🎂 อายุ",
                    value: introductionData.age,
                    inline: true,
                });
            }

            if (introductionData.gender) {
                infoEmbed.addFields({
                    name: "⚧️ เพศ",
                    value: introductionData.gender,
                    inline: true,
                });
            }

            if (introductionData.birthday) {
                infoEmbed.addFields({
                    name: "🎉 วันเกิด",
                    value: introductionData.birthday,
                    inline: true,
                });
            }

            if (introductionData.works) {
                infoEmbed.addFields({
                    name: "💼 งาน",
                    value: introductionData.works,
                    inline: true,
                });
            }

            if (introductionData.address) {
                infoEmbed.addFields({
                    name: "📍 ที่อยู่",
                    value: introductionData.address,
                    inline: true,
                });
            }

            if (introductionData.hobbies) {
                infoEmbed.addFields({
                    name: "🎨 งานอดิเรก",
                    value: introductionData.hobbies,
                    inline: true,
                });
            }

            if (introductionData.portfolio) {
                infoEmbed.addFields({
                    name: "🔗 พอร์ตโฟลิโอ",
                    value: introductionData.portfolio,
                    inline: true,
                });
            }

            if (introductionData.additionalInfo) {
                infoEmbed.addFields({
                    name: "📄 ข้อมูลเพิ่มเติม",
                    value: introductionData.additionalInfo,
                    inline: false,
                });
            }
        }
    } else {
        infoEmbed.addFields({
            name: "📝 ข้อมูลการแนะนำตัว",
            value: "ยังไม่มีข้อมูลการแนะนำตัว",
            inline: false,
        });
    }

    // เพิ่ม timestamp และ footer ใน embed สุดท้าย (กรณีที่ไม่มีการแบ่ง embed)
    infoEmbed.setTimestamp().setFooter({
        text: `ร้องขอโดย ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
    });

    await message.reply({ embeds: [infoEmbed] });
}
