const { SlashCommandBuilder } = require("@discordjs/builders");
const db = require('quick.db')
const fetch = require('node-fetch')
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setseller")
        .setDescription("Sets The seller key")
        .addStringOption((option) =>
            option
                .setName("sellerkey")
                .setDescription("Specify application seller key")
                .setRequired(true)
        ),
    async execute(interaction, client) {

        let sellerkey = interaction.options.getString("sellerkey")

        fetch(`https://keyauth.` + client.domain + `/api/seller/?sellerkey=${sellerkey}&type=setseller&format=text`)
            .then(res => res.text())
            .then(text => {
                if (text == "Seller Key Successfully Found") {
                    db.fetch(`token_${interaction.guild.id}`)
                    db.set(`token_${interaction.guild.id}`, sellerkey)
                    interaction.reply({ embeds: [new Discord.MessageEmbed().setTitle('Seller Key Successfully Set!').setColor("GREEN").setTimestamp()], ephemeral: true })
                }
                else {
                    interaction.reply({ embeds: [new Discord.MessageEmbed().setTitle('Seller Key Not Found!').addField("Where do I find seller key?", "In [Seller Settings](https://keyauth.win/dashboard/seller/settings/)").setColor("RED").setTimestamp()], ephemeral: true })
                }
            })
    },
};