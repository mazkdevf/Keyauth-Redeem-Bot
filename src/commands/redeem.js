const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const fetch = require('node-fetch')
const db = require('quick.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("redeem")
        .setDescription("Redeem a license key to get role.")
        .addStringOption((option) =>
            option
                .setName("license")
                .setDescription("Your license key that you wan't to redeem.")
                .setRequired(true)
        ),

    async execute(interaction, client) {

        let sellerkey = await db.get(`token_${interaction.guild.id}`)
        if (sellerkey === null) return interaction.reply({ embeds: [new Discord.MessageEmbed().setDescription(`Seller key haven't been set up yet!`).setColor("#2a2152").setTimestamp()], ephemeral: true, });

        let key = await interaction.options.getString("license")

        await interaction.deferReply({ ephemeral: true });

        interaction.editReply({
            embeds: [new Discord.MessageEmbed().setTitle('Redeeming...').setColor("#2a2152")],
            ephemeral: true,
        });

        async function checkResponseStatus(res) {
            if (res.ok) {
                giveroletouser();
            } else {

                const channel = interaction.guild.channels.cache.find(channel => channel.name === 'prebeta-logs');

                interaction.editReply({
                    embeds: [new Discord.MessageEmbed().setTitle('License Key Not Found').setColor("#2a2152")],
                    ephemeral: true,
                });

                if (channel) {
                    channel.send({
                        embeds: [new Discord.MessageEmbed().setAuthor({ name: "Wrong Key ALERT" }).addField('License:', "```" + `${key}` + "```", inline = false).addField('Discord:', message.author, inline = true).addField('DiscordID:', "```" + message.author + "```", inline = true).setColor("#2a2152").setFooter({ text: "KeyAuth Redeem Bot v1.6.2" }).setTimestamp()]
                    });
                }
            }
        }

        async function giveroletouser() {
            let role = interaction.member.guild.roles.cache.find(r => r.id === client.customer_id);

            /* Another Role?
            let role2 = interaction.member.guild.roles.cache.find(r => r.id === "ROLEID"); If you want to add other role
            await interaction.guild.members.cache.get(interaction.member.id).roles.add(role2);            
            */

            if (role) {
                //GIVE ROLE


                try {
                    await interaction.guild.members.cache.get(interaction.member.id).roles.add(role);
                } catch (err) {
                    console.log(err);
                }



                await interaction.guild.members.cache.get(interaction.member.id).roles.add(role);

                //REPLY
                interaction.editReply({
                    embeds: [new Discord.MessageEmbed().setTitle("License Successfully Redeemed!").setColor("#2a2152")],
                    ephemeral: true,
                })

                //Logs
                const channel = interaction.guild.channels.cache.find(channel => channel.name === 'prebeta-logs');

                if (channel) {
                    channel.send({
                        embeds: [new Discord.MessageEmbed().setAuthor({ name: "License Redeemed!" }).addField('License:', "```" + `${key}` + "```", inline = false).addField('Discord:', "```" + interaction.member.user.username + "```", inline = true).addField('DiscordID:', "```" + interaction.member.user.id + "```", inline = true).setColor("GREEN").setFooter({ text: "KeyAuth Redeem Bot v1.6.2" }).setTimestamp()],
                        ephemeral: true,
                    });
                }
            }

            return false;
        }

        fetch(`https://keyauth.` + client.domain + `/api/seller/?sellerkey=${sellerkey}&type=verify&key=${key}`)
            .then(checkResponseStatus);
    },
};