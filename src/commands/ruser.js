const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const fetch = require('node-fetch')
const db = require('quick.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ruser")
        .setDescription("Redeem User + Pass from license")
        .addStringOption((option) =>
            option
                .setName("license")
                .setDescription("Your license key that you wan't to redeem.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("Choose your own username if you don't want random one")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("password")
                .setDescription("Choose your own password if you don't want random one")
                .setRequired(false)
        ),

    async execute(interaction, client) {
        let sellerkey = await db.get(`token_${interaction.guild.id}`)
        if (sellerkey === null) return interaction.reply({ embeds: [new Discord.MessageEmbed().setDescription(`Seller key haven't been setupped!`).setColor("#2a2152").setTimestamp()], ephemeral: true, });

        let key = await interaction.options.getString("license")
        let username = await interaction.options.getString('username');
        let password = await interaction.options.getString('password');

        if (isEmpty(username)) {
            username = await generaterandomname(10);
        };

        if (isEmpty(password)) {
            password = await generate();
        };

        let un = username;
        let pw = password;

        await interaction.deferReply({ ephemeral: true });

        function checkResponseStatus(res) {
            if (res.ok) {
                genaccforlicense(interaction);
            } else {
                const channel = interaction.guild.channels.cache.find(channel => channel.name === 'prebeta-logs');

                interaction.editReply({
                    embeds: [new Discord.MessageEmbed().setTitle('License Key Not Found').setColor("#2a2152")],
                    ephemeral: true,
                });

                if (channel) {
                    channel.send({
                        embeds: [new Discord.MessageEmbed().setAuthor({ name: "Wrong Key ALERT" }).addField('License:', "```" + `${key}` + "```", inline = false).addField('Discord:', "```" + interaction.member.user.username + "```", inline = true).addField('DiscordID:', "```" + interaction.member.user.id + "```", inline = true).setColor("#2a2152").setFooter({ text: "KeyAuth Redeem Bot v3.0.2" }).setTimestamp()]
                    });
                }
            }
        }

        async function genaccforlicense(interaction) {
            fetch(`https://keyauth.` + client.domain + `/api/seller/?sellerkey=${sellerkey}&type=activate&user=${un}&key=${key}&pass=${pw}&format=json`)
                .then(res => res.json())
                .then(json => {
                    if (json.success) {

                        const FirstSub = json.info.subscriptions.subscriptions[0];
                        const DaysFromLicense = prettySeconds(FirstSub.timeleft);
                        const SubName = FirstSub.subscription;

                        fetch(`https://keyauth.` + client.domain + `/api/seller/?sellerkey=${sellerkey}&type=deluser&user=${un}`).then(res => res.json())
                            .then(json => {
                                if (json.success) {
                                    fetch(`https://keyauth.` + client.domain + `/api/seller/?sellerkey=${sellerkey}&type=adduser&user=${un}&sub=${SubName}&expiry=${DaysFromLicense}&pass=${pw}`)
                                        .then(res => res.json()).then(json => {
                                            if (json.success) {


                                                //* Logging
                                                const channel = interaction.guild.channels.cache.find(channel => channel.name === 'prebeta-logs');
                                                if (channel) {
                                                    channel.send({
                                                        embeds: [new Discord.MessageEmbed().setAuthor({ name: "License Redeemed" }).addField('License:', "```" + `${key}` + "```", false).addField('Username:', "```" + un + "```").addField('Password', "```" + pw + "```").addField('Discord:', "```" + interaction.member.user.username + "```", inline = true).addField('DiscordID:', "```" + interaction.member.user.id + "```", inline = true).setColor("#2a2152").setFooter({ text: "KeyAuth Redeem Bot v3.0.2" }).setTimestamp()]
                                                    });
                                                }



                                                interaction.editReply({
                                                    embeds: [new Discord.MessageEmbed().setTitle('License Successfully Activated!').setFooter({ text: "KeyAuth Redeem Bot v3.0.2" }).addField('Username:', "```" + un + "```").addField('Password', "```" + pw + "```").addField('License:', "```" + `${key}` + "```").addField('Expiry:', "```" + DaysFromLicense + " Days```").setColor("#2a2152").setTimestamp()],
                                                    ephemeral: true,
                                                });

                                                disableoldlicense();
                                            } else {
                                                interaction.editReply({
                                                    embeds: [new Discord.MessageEmbed().setTitle(json.message).setColor("#2a2152")],
                                                    ephemeral: true,
                                                });
                                            }
                                        });
                                } else {
                                    interaction.editReply({
                                        embeds: [new Discord.MessageEmbed().setTitle('Something went wrong').setColor("#2a2152")],
                                        ephemeral: true,
                                    });
                                }
                            });
                    } else {
                        interaction.editReply({
                            embeds: [new Discord.MessageEmbed().setTitle(json.message).setColor("#2a2152")],
                            ephemeral: true
                        });
                        return false;
                    }
                })
        }

        function disableoldlicense() {
            fetch(`https://keyauth.` + client.domain + `/api/seller/?sellerkey=${sellerkey}&type=del&key=${key}`);
        }

        fetch(`https://keyauth.` + client.domain + `/api/seller/?sellerkey=${sellerkey}&type=verify&key=${key}`)
            .then(checkResponseStatus);
    },
};

//* Check if string / variable is empty or null
function isEmpty(str) {
    return (!str || str.length === 0);
}

//* Seconds to Days - original: https://www.npmjs.com/package/pretty-seconds
function prettySeconds(seconds) {
    let prettyString = ''
    let data = []

    if (typeof seconds === 'number') {
        data = quantify(data, 'day', parseInt(fix10(seconds / 86400)))

        prettyString = data;
    }

    return prettyString;
}

function fix10(number) {
    return number.toFixed(10)
}

function quantify(data, unit, value, allowZero) {
    if (value || (allowZero && !value)) {
        if (value > 1 || value < -1 || value === 0) {
            unit += 's'
        }

        data.push(value)
    }

    return data
}


//* Username + Password Generators
async function generate(count = 8) {
    let password = ''
    while (password.length < count) {
        password += Math.random().toString(36).substr(2)
    }
    return password.substr(0, count)
}

async function generaterandomname(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}