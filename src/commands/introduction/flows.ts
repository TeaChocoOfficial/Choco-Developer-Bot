//-Path: "Choco-Developer-Bot/src/commands/introduction/flows.ts"
import {
    User,
    Guild,
    Message,
    ButtonStyle,
    EmbedBuilder,
    ButtonBuilder,
    ComponentType,
    ActionRowBuilder,
    OmitPartialGroupDMChannel,
} from "discord.js";
import {
    createButtons,
    createModeButtons,
    createConfirmButtons,
    createEditFieldButtons,
    createDisplayChoiceButtons,
} from "./buttons";
import { questions } from "./config";
import { saveIntroduction } from "./database";
import { IIntroduction } from "../../models/Introduction";
import { parseCustomIntroduction } from "./parser";
import { createQuestionEmbed, createSummaryEmbed } from "./embeds";

/**
 * ขั้นตอนการยืนยันข้อมูลก่อนบันทึก
 * @param data - ข้อมูลที่เก็บได้
 * @param message - ข้อความต้นทาง
 * @param onRestart - ฟังก์ชันการเริ่มใหม่
 */
export async function confirmIntroduction(
    data: IIntroduction,
    message: OmitPartialGroupDMChannel<Message<boolean>>,
    onRestart: () => Promise<void>,
) {
    const filter = (interaction: any) =>
        interaction.user.id === message.author.id;
    const embed = createSummaryEmbed(message.author, message.guild!, data);
    const hasRaw = !!data.rawContent;

    embed.setTitle("🔍 ตรวจสอบข้อมูลความถูกต้อง");
    embed.setDescription(
        "ข้อมูลนี้คือข้อมูลที่ระบบจัดเก็บลงฐานข้อมูล กรุณาตรวจสอบความถูกต้องครับ",
    );

    const confirmMessage = await message.channel.send({
        content: `<@${message.author.id}>`,
        embeds: [embed],
        components: [createConfirmButtons(hasRaw)],
    });

    const collector = confirmMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter,
        time: 120000,
    });

    collector.on("collect", async (interaction) => {
        await interaction.deferUpdate();

        if (interaction.customId === "confirm") {
            collector.stop();
            await confirmMessage.delete().catch(() => {});
            await askDisplayChoice(data, message, onRestart);
        }

        if (interaction.customId === "edit") {
            collector.stop();
            await confirmMessage.delete().catch(() => {});
            await handleEditSpecificFields(data, message, onRestart);
        }

        if (interaction.customId === "edit_step") {
            collector.stop();
            await confirmMessage.delete().catch(() => {});
            await startStepByStep(message, data);
        }

        if (interaction.customId === "restart") {
            collector.stop();
            await confirmMessage.delete().catch(() => {});
            await onRestart();
        }

        if (interaction.customId === "cancel") {
            collector.stop();
            await confirmMessage.delete().catch(() => {});
        }
    });

    collector.on("end", (collected, reason) => {
        if (reason === "time" && collected.size === 0) {
            confirmMessage.delete().catch(() => {});
        }
    });
}

/**
 * ถามรูปแบบการเลือกแสดงผล
 * @param data - ข้อมูล
 * @param message - ข้อความต้นทาง
 * @param onRestart - ฟังก์ชันการเริ่มใหม่
 */
export async function askDisplayChoice(
    data: IIntroduction,
    message: OmitPartialGroupDMChannel<Message<boolean>>,
    onRestart: () => Promise<void>,
) {
    if (!data.rawContent) {
        data.displayType = "list";
        return await saveIntroduction(data, message);
    }

    const choiceEmbed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("🖼️ เลือกรูปแบบการแสดงผล")
        .setDescription(
            "คุณต้องการให้ Embed แนะนำตัวของคุณแสดงผลในแบบใด?\n\n" +
                "📑 **แสดงเป็นลิสต์:** แสดงข้อมูลที่ระบบจัดเก็บเป็นหัวข้อๆ\n" +
                "📝 **แสดงตามที่พิมพ์:** แสดงข้อความต้นฉบับที่คุณพิมพ์ส่งมา",
        );

    const choiceMessage = await message.channel.send({
        content: `<@${message.author.id}>`,
        embeds: [choiceEmbed],
        components: [createDisplayChoiceButtons()],
    });

    const collector = choiceMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (interaction) => interaction.user.id === message.author.id,
        time: 60000,
    });

    collector.on("collect", async (interaction) => {
        await interaction.deferUpdate();

        if (interaction.customId === "display_list") {
            data.displayType = "list";
        } else {
            data.displayType = "raw";
        }

        collector.stop();
        await choiceMessage.delete().catch(() => {});
        await saveIntroduction(data, message);
    });

    collector.on("end", (collected, reason) => {
        if (reason === "time" && collected.size === 0) {
            choiceMessage.delete().catch(() => {});
        }
    });
}

/**
 * จัดการการแก้ไขเฉพาะจุด
 * @param data - ข้อมูลปัจจุบัน
 * @param message - ข้อความต้นทาง
 * @param onRestart - ฟังก์ชันในการกดเริ่มใหม่
 */
export async function handleEditSpecificFields(
    data: IIntroduction,
    message: OmitPartialGroupDMChannel<Message<boolean>>,
    onRestart: () => Promise<void>,
) {
    const progressList = questions
        .map((item) => {
            const value = data[item.key];
            const status = value ? "✅" : "⏩";
            const label = value ? `${item.label}: ${value}` : item.label;
            return `${status} ${item.emoji} ${label}`;
        })
        .join("\n");

    const editEmbed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("✏️ แก้ไขเฉพาะจุด")
        .setDescription(
            `**ข้อมูลปัจจุบัน:**\n${progressList}\n\nกรุณาเลือกหัวข้อที่ต้องการแก้ไขครับ`,
        );

    const editMessage = await message.channel.send({
        content: `<@${message.author.id}>`,
        embeds: [editEmbed],
        components: createEditFieldButtons(),
    });

    const buttonCollector = editMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (interaction) => interaction.user.id === message.author.id,
        time: 60000,
    });

    buttonCollector.on("collect", async (interaction) => {
        const key = interaction.customId.replace(
            "edit_",
            "",
        ) as keyof IIntroduction;
        const index = questions.findIndex((q) => q.key === key);
        const question = questions[index];

        if (!question) return;

        await interaction.deferUpdate();
        buttonCollector.stop();
        await editMessage.delete().catch(() => {});

        const questionEmbed = createQuestionEmbed(
            index,
            questions.length,
            data,
            true,
        );
        if (!questionEmbed) return;

        const askMessage = await message.channel.send({
            embeds: [questionEmbed],
        });

        const messageCollector = message.channel.createMessageCollector({
            filter: (response) => response.author.id === message.author.id,
            time: 60000,
            max: 1,
        });

        messageCollector.on("collect", async (response) => {
            const answer = response.content.trim();
            (data as any)[key] = answer;

            await response.delete().catch(() => {});
            await askMessage.delete().catch(() => {});
            await confirmIntroduction(data, message, onRestart);
        });

        messageCollector.on("end", async (collected, reason) => {
            if (reason === "time" && collected.size === 0) {
                await askMessage.delete().catch(() => {});
                await confirmIntroduction(data, message, onRestart);
            }
        });
    });

    buttonCollector.on("end", (collected, reason) => {
        if (reason === "time" && collected.size === 0) {
            editMessage.delete().catch(() => {});
            confirmIntroduction(data, message, onRestart);
        }
    });
}

/**
 * เริ่มโหมดแนะนำตัวแบบกำหนดเองรวดเดียว
 * @param message - ข้อความต้นทาง
 */
export async function startCustomMode(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
    initialData?: IIntroduction,
) {
    const template =
        "```\n" +
        "ข้อมูลส่วนตัว\n" +
        "ชื่อ: (จำเป็น)\n" +
        "เพศ:\n" +
        "วันเกิด:\n" +
        "อายุ:\n" +
        "ที่อยู่:\n\n" +
        "งานอดิเรก: (เช่น เล่นเกม ดูอนิเมะ)\n" +
        "งานประจำ: (เช่น นักเรียน พนักงาน)\n" +
        "ผลงาน: (เช่น ลิงค์ Github/Portfolio)\n" +
        "รายละเอียดเพิ่มเติม: (เช่น เป้าหมาย)\n" +
        "```";

    const isEdit = !!initialData;

    const customEmbed = new EmbedBuilder()
        .setColor(isEdit ? 0xe67e22 : 0x2ecc71)
        .setTitle(isEdit ? "✏️ แก้ไขข้อมูลแบบอิสระ" : "📝 แนะนำตัวแบบอิสระ")
        .setDescription(
            (isEdit ?
                "คุณสามารถพิมพ์ข้อมูลใหม่เพื่อแก้ไขได้เลยครับ หรือจะใช้เทมเพลตเดิมด้านล่างก็ได้\n\n"
            :   "คุณสามารถพิมพ์ข้อมูลของคุณมาได้เลยอย่างอิสระ หรือจะใช้เทมเพลตด้านล่างนี้ก็ได้ครับ\n\n") +
                "💡 **คำแนะนำ:** พยายามระบุหัวข้อ (เช่น ชื่อ: อายุ:) เพื่อความแม่นยำ\n\n" +
                (isEdit && initialData.rawContent ?
                    "```\n" + initialData.rawContent + "\n```"
                :   template),
        );

    const buttons = [
        new ButtonBuilder()
            .setCustomId("switch_step")
            .setLabel("สลับไปตอบทีละข้อ")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📑"),
        new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("ยกเลิก")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("❌"),
    ];

    const customMessage = await message.channel.send({
        content: `<@${message.author.id}>`,
        embeds: [customEmbed],
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(buttons),
        ],
    });

    const collector = message.channel.createMessageCollector({
        filter: (response: Message) => response.author.id === message.author.id,
        time: 300000,
    });

    const buttonCollector = customMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (interaction) => interaction.user.id === message.author.id,
        time: 300000,
    });

    buttonCollector.on("collect", async (interaction) => {
        await interaction.deferUpdate();

        if (interaction.customId === "cancel") {
            collector.stop();
            buttonCollector.stop();
            await customMessage.delete().catch(() => {});
            return;
        }

        if (interaction.customId === "switch_step") {
            collector.stop();
            buttonCollector.stop();
            await customMessage.delete().catch(() => {});
            await startStepByStep(message);
        }
    });

    collector.on("collect", async (response) => {
        const content = response.content.trim();
        const parsedData = parseCustomIntroduction(content) as IIntroduction;

        // รวมข้อมูลใหม่เข้ากับข้อมูลเก่า (ถ้ามี)
        const data =
            initialData ? { ...initialData, ...parsedData } : parsedData;
        data.rawContent = content;

        if (!data.name) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xe74c3c)
                .setDescription("❌ กรุณาระบุชื่อในส่วน `ชื่อ:` ด้วยครับ");
            const errorMessage = await message.channel.send({
                embeds: [errorEmbed],
            });
            setTimeout(() => errorMessage.delete().catch(() => {}), 5000);
            await response.delete().catch(() => {});
            return;
        }

        collector.stop();
        buttonCollector.stop();
        await response.delete().catch(() => {});
        await customMessage.delete().catch(() => {});
        await confirmIntroduction(data as IIntroduction, message, () =>
            startCustomMode(message, initialData),
        );
    });
}

/**
 * เริ่มโหมดแนะนำตัวแบบทีละขั้นตอน
 * @param message - ข้อความต้นทาง
 * @param initialData - ข้อมูลตั้งต้น (ถ้ามี)
 */
export async function startStepByStep(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
    initialData?: IIntroduction,
) {
    let currentQuestionIndex = 0;
    const collectedData = initialData || ({} as IIntroduction);

    const startEmbed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(initialData ? "📝 ตรวจสอบทีละหัวข้อ" : "👋 เริ่มการแนะนำตัว")
        .setDescription(
            `สวัสดีครับ **${message.author.username}**! ` +
                (initialData ?
                    "มาตรวจสอบข้อมูลทีละข้อกันครับ"
                :   "มาเริ่มกันเลย") +
                "\n\n" +
                "📌 **วิธีใช้งาน:**\n" +
                "• พิมพ์คำตอบเพื่อตอบคำถาม\n" +
                "• กดปุ่ม `ย้อนกลับ` เพื่อแก้ไข\n" +
                "• กดปุ่ม `ไม่ระบุ` หากไม่ต้องการตอบ\n" +
                "• กดปุ่ม `ยกเลิก` เพื่อปิด",
        );

    const startMessage = await message.channel.send({
        content: `<@${message.author.id}>`,
        embeds: [startEmbed],
    });

    const askQuestion = async () => {
        const currentQuestion = questions[currentQuestionIndex];
        const existingValue =
            initialData ? (initialData as any)[currentQuestion.key] : null;
        const buttons = createButtons(
            currentQuestionIndex,
            !!initialData,
            existingValue,
        );
        const filter = (response: Message) =>
            response.author.id === message.author.id;
        const embed = createQuestionEmbed(
            currentQuestionIndex,
            questions.length,
            collectedData,
        );
        if (!embed) return;

        const questionMessage = await message.channel.send({
            embeds: [embed],
            components: [buttons],
        });

        const messageCollector = message.channel.createMessageCollector({
            filter,
            time: 120000,
        });

        const buttonCollector = questionMessage.createMessageComponentCollector(
            {
                componentType: ComponentType.Button,
                filter: (interaction) =>
                    interaction.user.id === message.author.id,
                time: 120000,
            },
        );

        let answered = false;

        messageCollector.on("collect", async (response) => {
            if (answered) return;
            answered = true;

            const answer = response.content.trim();

            // ลบข้อความคำตอบของผู้ใช้
            await response.delete().catch(() => {});

            const currentQuestion = questions[currentQuestionIndex];
            if (currentQuestion)
                collectedData[currentQuestion.key] = answer as any;

            // ลบ Embed คำถามเก่า
            await questionMessage.delete().catch(() => {});

            messageCollector.stop();
            buttonCollector.stop();

            currentQuestionIndex++;

            if (currentQuestionIndex < questions.length) {
                await askQuestion();
            } else {
                await startMessage.delete().catch(() => {});
                await confirmIntroduction(collectedData, message, () =>
                    startStepByStep(message),
                );
            }
        });

        buttonCollector.on("collect", async (interaction) => {
            if (answered) return;
            answered = true;

            await interaction.deferUpdate();

            if (interaction.customId === "cancel") {
                messageCollector.stop();
                buttonCollector.stop();

                await questionMessage.delete().catch(() => {});
                await startMessage.delete().catch(() => {});

                const cancelEmbed = new EmbedBuilder()
                    .setColor(0xe74c3c)
                    .setTitle("❌ ยกเลิกการแนะนำตัว")
                    .setDescription("คุณได้ยกเลิกการแนะนำตัวแล้ว");
                const cancelMessage = await message.channel.send({
                    embeds: [cancelEmbed],
                });

                setTimeout(() => cancelMessage.delete().catch(() => {}), 10000);
                return;
            }

            if (interaction.customId === "keep") {
                messageCollector.stop();
                buttonCollector.stop();

                await questionMessage.delete().catch(() => {});

                const currentQuestion = questions[currentQuestionIndex];
                if (currentQuestion && initialData)
                    collectedData[currentQuestion.key] = (initialData as any)[
                        currentQuestion.key
                    ];

                currentQuestionIndex++;

                if (currentQuestionIndex < questions.length) {
                    await askQuestion();
                } else {
                    await startMessage.delete().catch(() => {});
                    await confirmIntroduction(collectedData, message, () =>
                        startStepByStep(message),
                    );
                }
                return;
            }

            if (interaction.customId === "skip") {
                messageCollector.stop();
                buttonCollector.stop();

                await questionMessage.delete().catch(() => {});

                currentQuestionIndex++;

                if (currentQuestionIndex < questions.length) {
                    await askQuestion();
                } else {
                    await startMessage.delete().catch(() => {});
                    await confirmIntroduction(collectedData, message, () =>
                        startStepByStep(message),
                    );
                }
            }

            if (interaction.customId === "back") {
                messageCollector.stop();
                buttonCollector.stop();

                await questionMessage.delete().catch(() => {});

                currentQuestionIndex--;
                await askQuestion();
            }

            if (interaction.customId === "summary") {
                messageCollector.stop();
                buttonCollector.stop();

                await questionMessage.delete().catch(() => {});
                await startMessage.delete().catch(() => {});

                await confirmIntroduction(collectedData, message, () =>
                    startStepByStep(message),
                );
            }
        });

        buttonCollector.on("end", (collected, reason) => {
            if (reason === "time" && !answered) {
                questionMessage.delete().catch(() => {});
                startMessage.delete().catch(() => {});

                const timeoutEmbed = new EmbedBuilder()
                    .setColor(0xe74c3c)
                    .setTitle("⏰ หมดเวลา")
                    .setDescription("กรุณาเริ่มใหม่โดยพิมพ์ `สวัสดี` ครับ");
                message.channel
                    .send({ embeds: [timeoutEmbed] })
                    .then((timeoutMessage) => {
                        setTimeout(
                            () => timeoutMessage.delete().catch(() => {}),
                            10000,
                        );
                    });
            }
        });
    };

    await askQuestion();
}
