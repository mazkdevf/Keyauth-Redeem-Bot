const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
const db = require('quick.db')
const fetch = require('node-fetch')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setseller")
        .setDescription("Set up the sellerkey for bot.")
        .addStringOption((option) =>
            option
                .setName("sellerkey")
                .setDescription("Specify application seller key")
                .setRequired(true)
        ),
    async execute(interaction, client) {

        let sellerkey = await interaction.options.getString("sellerkey")

        await interaction.deferReply({ ephemeral: true });

        fetch(`https://keyauth.` + client.domain + `/api/seller/?sellerkey=${sellerkey}&type=setseller&format=text`)
            .then(res => res.text())
            .then(text => {
                if (text == "Seller Key Successfully Found") {
                    db.fetch(`token_${interaction.guild.id}`)
                    db.set(`token_${interaction.guild.id}`, sellerkey)
                    interaction.editReply({ embeds: [new EmbedBuilder().setTitle('Seller Key Successfully Set!').setColor(Colors.Green)], ephemeral: true })
                }
                else {
                    interaction.editReply({ embeds: [new EmbedBuilder().setTitle('Seller Key Not Found!')
                    .addFields(
                        { name: 'Where do I find seller key?', value: "In [Seller Settings](https://keyauth.win/dashboard/seller/settings/)", inline: false }
                    )
                    .setColor(Colors.Red)], ephemeral: true })
                }
            })
    },
};