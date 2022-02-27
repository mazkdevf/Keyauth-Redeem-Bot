const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("The help command, what do you expect?"),
    
    async execute(interaction) {

        let prefix = "/"; // Slash Prefix

        const embed = new Discord.MessageEmbed()
        .setTitle('Redeem Help')
        .addField('`redeem`', `Redeem a License. \nArgs: **${prefix}redeem**`, true)
        .addField('`ruser`', `Redeem a Username + password from license \nArgs: **${prefix}ruser**`, true)
        .addField('`rlogs`', `Enable Logging for redeems, / ye \nArgs: **${prefix}rlogs**`, false)
        .setFooter({ text: "KeyAuth Redeem Bot v1.6.2" })
        .setTimestamp()

        interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};