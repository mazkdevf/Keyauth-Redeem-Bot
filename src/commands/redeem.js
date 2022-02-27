const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const fetch = require('node-fetch')
const db = require('quick.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("redeem")
        .setDescription("Redeem a license key")
        .addStringOption((option) => 
            option
                .setName("license")
                .setDescription("Your license key that you wan't to redeem.")
                .setRequired(true)
        ),
    
    async execute(interaction, client) {

        let sellerkey = await db.get(`token_${interaction.guild.id}`)
        if(sellerkey === null) return interaction.reply({ embeds: [new Discord.MessageEmbed().setDescription(`Seller key haven't been setupped!`).setColor("RED").setTimestamp()], ephemeral: true, });

        let key = interaction.options.getString("license")

        function checkResponseStatus(res) {
            if(res.ok){
                disableoldlicense();
                giveroletouser();
            } else {
        
                const channel = interaction.guild.channels.cache.find(channel => channel.name === 'prebeta-logs');
        
                interaction.reply({
                    embeds: [new Discord.MessageEmbed().setTitle('License Key Not Found').setColor("RED")],
                    ephemeral: true,
                });
        
                if (channel) {
                    channel.send({
                        embeds: [new Discord.MessageEmbed().setAuthor({ name: "Wrong Key ALERT" }).addField('License:', "```" + `${key}` + "```", inline = false).addField('Discord:', message.author, inline = true).addField('DiscordID:', "```" + message.author + "```", inline = true).setColor("RED").setFooter({ text: "KeyAuth Redeem Bot v1.6.2" }).setTimestamp()]
                    });
                }
        }}

        function giveroletouser() {
            let role = interaction.member.guild.roles.cache.find(r => r.id === client.customer_id);
            if (role) {
                //GIVE ROLE
                interaction.guild.members.cache.get(interaction.member.id).roles.add(role);

                //REPLY
                interaction.reply({
                    embeds: [new Discord.MessageEmbed().setTitle("License Successfully Redeemed!").setColor("PURPLE")],
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

        function disableoldlicense() {
            fetch(`https://keyauth.` + client.domain + `/api/seller/?sellerkey=${sellerkey}&type=del&key=${key}`);
        }

        fetch(`https://keyauth.` + client.domain + `/api/seller/?sellerkey=${sellerkey}&type=verify&key=${key}`)
        .then(checkResponseStatus);
    },
};