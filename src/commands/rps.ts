//-Path: "Choco-Developer-Bot/src/commands/rps.ts"
import {
    Message,
    ButtonStyle,
    EmbedBuilder,
    ButtonBuilder,
    ComponentType,
    ActionRowBuilder,
    OmitPartialGroupDMChannel,
} from 'discord.js';

/**
 * จัดการคำสั่งเป่ายิงฉุบ
 * @param message - ข้อความที่ส่งมา
 */
export async function handleRPS(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
) {
    if (message.author.bot) return;

    const content = message.content.trim().toLowerCase();
    if (!['เป่ายิงฉุบ', 'ปยฉ', 'rps'].includes(content)) return;

    const choices = [
        { name: 'ค้อน', emoji: '🪨', id: 'rock' },
        { name: 'กระดาษ', emoji: '📄', id: 'paper' },
        { name: 'กรรไกร', emoji: '✂️', id: 'scissors' },
    ];

    const gameEmbed = new EmbedBuilder()
        .setColor(0x00ae86)
        .setTitle('🎮 เกมเป่ายิงฉุบ')
        .setDescription('เลือกอาวุธของคุณ!')
        .setTimestamp()
        .setFooter({
            text: `ท้าทายโดย ${message.author.username}`,
            iconURL: message.author.displayAvatarURL(),
        });

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        choices.map((choice) =>
            new ButtonBuilder()
                .setCustomId(choice.id)
                .setLabel(choice.name)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(choice.emoji),
        ),
    );

    const botResponse = await message.reply({
        embeds: [gameEmbed],
        components: [buttonRow],
    });

    const interactionCollector = botResponse.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
    });

    interactionCollector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
            await interaction.reply({
                content: 'คุณไม่ใช่คนที่เรียกใช้คำสั่งนี้!',
                ephemeral: true,
            });
            return;
        }

        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        const userChoice = choices.find(
            (choice) => choice.id === interaction.customId,
        )!;

        let resultText = '';
        if (userChoice.id === botChoice.id) {
            resultText = 'เสมอหน้ากัน! 🤝';
        } else if (
            (userChoice.id === 'rock' && botChoice.id === 'scissors') ||
            (userChoice.id === 'paper' && botChoice.id === 'rock') ||
            (userChoice.id === 'scissors' && botChoice.id === 'paper')
        ) {
            resultText = 'คุณชนะ! 🎉';
        } else {
            resultText = 'คุณแพ้! 💀';
        }

        const resultEmbed = new EmbedBuilder()
            .setColor(
                resultText.includes('ชนะ')
                    ? 0x2ecc71
                    : resultText.includes('เสมอ')
                      ? 0xf1c40f
                      : 0xe74c3c,
            )
            .setTitle('🎮 ผลการเป่ายิงฉุบ')
            .addFields(
                {
                    name: '👤 คุณเลืก',
                    value: `${userChoice.emoji} ${userChoice.name}`,
                    inline: true,
                },
                {
                    name: '🤖 บอทเลือก',
                    value: `${botChoice.emoji} ${botChoice.name}`,
                    inline: true,
                },
                {
                    name: '📊 ผลลัพธ์',
                    value: `**${resultText}**`,
                    inline: false,
                },
            )
            .setTimestamp()
            .setFooter({
                text: `ผู้เล่น: ${message.author.username}`,
                iconURL: message.author.displayAvatarURL(),
            });

        await interaction.update({
            embeds: [resultEmbed],
            components: [],
        });

        interactionCollector.stop();
    });

    interactionCollector.on('end', (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
            botResponse.edit({
                content: 'หมดเวลาแล้ว! ลองใหม่อีกครั้ง',
                components: [],
            });
        }
    });
}
