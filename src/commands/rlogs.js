const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rlogs")
        .setDescription("Logging for keyauth redeem bot"),

    async execute(interaction, client) {

        const channel = interaction.guild.channels.cache.find(channel => channel.name === 'prebeta-logs');
        if (channel) {
            console.log(`[RLOGS] ${interaction.member.user.id} tryed to create Logging channel, but it already exists.`);

            const embed = new MessageEmbed()
                .setDescription(`<@${interaction.member.user.id}>, ${channel} **Already Exists.** \n\n**If you don't want to log anymore just delete: ** ${channel}.`);

            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            })

            return false;
        } else {
            console.log("[RLOGS] Creating Logging Channel");

            interaction.guild.channels.create("PreBeta-Logs", {
                type: "text",
                permissionOverwrites: [
                    {
                        id: client.admin_role_id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                    },
                    {
                        id: interaction.guild.roles.everyone,
                        deny: ['VIEW_CHANNEL'],
                    },
                ],
            })

            const embed = new MessageEmbed()
                .setTitle("Hello, I have successfully made your logging channel :)");

            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            })

        }
    },
};