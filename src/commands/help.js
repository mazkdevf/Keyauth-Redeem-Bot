const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("The help command, what do you expect?"),

    async execute(interaction) {

        let prefix = "/"; // Slash Prefix

        await interaction.deferReply({ ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('Redeem Help')
            .addField('`redeem`', `Redeem a License. \nArgs: **${prefix}redeem**`, true)
            .addField('`ruser`', `Redeem a Username + password from license \nArgs: **${prefix}ruser**`, true)
            .addField('`rlogs`', `Enable Logging for redeems, / ye \nArgs: **${prefix}rlogs**`, false)
            .setFooter({ text: "KeyAuth Redeem Bot v5.2.2" })
            .setTimestamp()

        interaction.editReply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};