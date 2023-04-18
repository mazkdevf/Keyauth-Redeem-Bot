const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
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
        if (sellerkey === null) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`Seller key haven't been set up yet!`).setColor(Colors.Red)], ephemeral: true, });

        let key = await interaction.options.getString("license")

        if(client.use_once) {
            if(db.fetch(`${key}`)) {
                //Logs
                const channel = interaction.guild.channels.cache.find(channel => channel.name === 'prebeta-logs');

                if (channel) {
                    channel.send({
                        embeds: [new EmbedBuilder().setAuthor({ name: "License already redeemed!" })
                        .addFields(
                            { name: 'License:', value: "```" + `${key}` + "```", inline: false },
                            { name: 'Discord:', value: "```" + interaction.member.user.username + "#" + interaction.member.user.discriminator + "```", inline: true },
                            { name: 'DiscordID:', value: "```" + interaction.member.user.id + "```", inline: true },
                        )
                        
                        
                        .setColor(Colors.Red).setFooter({ text: "KeyAuth Redeem Bot v5.2.2" })]
                    });
                }

                return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`This key has already been redeemed!`).setColor(Colors.Red)], ephemeral: true, });
            }
        }

        await interaction.deferReply({ ephemeral: true });

        interaction.editReply({
            embeds: [new EmbedBuilder().setTitle('Redeeming...').setColor(Colors.Red)],
            ephemeral: true,
        });

        async function checkResponseStatus(res) {
            if (res.ok) {
                giveroletouser();
            } else {

                const channel = interaction.guild.channels.cache.find(channel => channel.name === 'prebeta-logs');

                interaction.editReply({
                    embeds: [new EmbedBuilder().setTitle('License Key Not Found').setColor(Colors.Red)],
                    ephemeral: true,
                });

                if (channel) {
                    channel.send({
                        embeds: [new EmbedBuilder().setAuthor({ name: "Wrong Key ALERT" })
                        .addFields(
                            { name: 'License:', value: "```" + `${key}` + "```", inline: false },
                            { name: 'Discord:', value: "```" + interaction.member.user.username + "#" + interaction.member.user.discriminator + "```", inline: true },
                            { name: 'DiscordID:', value: "```" + interaction.member.user.id + "```", inline: true },
                        )
                        
                        
                        .setColor(Colors.Red).setFooter({ text: "KeyAuth Redeem Bot v5.2.2" })]
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

                if(client.use_once) {
                    db.fetch(`${key}`)
                    db.set(`${key}`, '1')
                }

                //REPLY
                interaction.editReply({
                    embeds: [new EmbedBuilder().setTitle("License Successfully Redeemed!").setColor(Colors.Red)],
                    ephemeral: true,
                })

                //Logs
                const channel = interaction.guild.channels.cache.find(channel => channel.name === 'prebeta-logs');

                if (channel) {
                    channel.send({
                        embeds: [new EmbedBuilder().setAuthor({ name: "License Redeemed!" })
                        .addFields(
                            { name: 'License:', value: "```" + `${key}` + "```", inline: false },
                            { name: 'Discord:', value: "```" + interaction.member.user.username + "#" + interaction.member.user.discriminator + "```", inline: true },
                            { name: 'DiscordID:', value: "```" + interaction.member.user.id + "```", inline: true },
                        )
                        
                        
                        .setColor(Colors.Green).setFooter({ text: "KeyAuth Redeem Bot v1.6.2" })],
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