const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
const fetch = require('node-fetch')
const db = require('quick.db');

var sendOnDMS = false; // Change this to true, if you want that the redeemed account details will be send on DMS

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
        if (sellerkey === null) return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`Seller key haven't been setupped!`).setColor(Colors.Red).setTimestamp()], ephemeral: true, });

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

        interaction.editReply({
            embeds: [new EmbedBuilder().setAuthor({ name: `Redeeming your account...` }).setColor(Colors.Gold)],
            ephemeral: true,
        });

        function checkResponseStatus(res) {
            if (res.ok) {
                genaccforlicense(interaction);
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
                            { name: 'Discord:', value: "```" + interaction.member.user.username + "```", inline: true },
                            { name: 'DiscordID:', value: "```" + interaction.member.user.id + "```", inline: true }
                        )
                        .setColor(Colors.Red).setFooter({ text: "KeyAuth Redeem Bot v5.2.2" }).setTimestamp()]
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
                                                        embeds: [new EmbedBuilder()
                                                            .setAuthor({ name: "License Redeemed" })
                                                            .addFields(
                                                                {
                                                                    name: 'License',
                                                                    value: "```" + `${key}` + "```",
                                                                    inline: false
                                                                },
                                                                {
                                                                    name: 'Username',
                                                                    value: "```" + un + "```",
                                                                    inline: false
                                                                },
                                                                {
                                                                    name: 'Password',
                                                                    value: "```" + pw + "```",
                                                                    inline: false
                                                                },
                                                                {
                                                                    name: 'Discord',
                                                                    value: "```" + interaction.member.user.username + "```",
                                                                    inline: true
                                                                },
                                                                {
                                                                    name: 'DiscordID',
                                                                    value: "```" + interaction.member.user.id + "```",
                                                                    inline: true
                                                                }
                                                            )
                                                            .setColor(Colors.Green).setFooter({ text: "KeyAuth Redeem Bot v5.2.2" }).setTimestamp()]
                                                    });
                                                }

                                                if (sendOnDMS) {
                                                    interaction.editReply({
                                                        embeds: [new EmbedBuilder().setTitle('License Have been redeemed, please check your dms').setColor(Colors.Red)],
                                                    });

                                                    interaction.member.send({
                                                        embeds: [new EmbedBuilder().setTitle('License Successfully Activated!').setFooter({ text: "KeyAuth Redeem Bot v5.2.2" })
                                                        .addFields(
                                                            {
                                                                name: 'License',
                                                                value: "```" + `${key}` + "```",
                                                                inline: false
                                                            }, 
                                                            {
                                                                name: 'Username',
                                                                value: "```" + un + "```",
                                                                inline: false
                                                            },
                                                            {
                                                                name: 'Expiry',
                                                                value: "```" + DaysFromLicense + " Days```",
                                                                inline: false
                                                            },
                                                            {
                                                                name: 'Password',
                                                                value: "```" + pw + "```",
                                                                inline: false
                                                            }
                                                        )
                                                        
                                                        .setColor(Colors.Green).setTimestamp()],
                                                        ephemeral: true,
                                                    }).catch(error => {
                                                        if (error.code === 50007) {
                                                            interaction.editReply({
                                                                embeds: [new EmbedBuilder().setAuthor({ name: "DMS Closed so i will give here. " }).setTitle('License Successfully Activated!')
                                                                .setFooter({ text: "KeyAuth Redeem Bot v5.2.2" })
                                                                .addFields(
                                                                    {
                                                                        name: 'License',
                                                                        value: "```" + `${key}` + "```",
                                                                        inline: false
                                                                    },
                                                                    {
                                                                        name: 'Username',
                                                                        value: "```" + un + "```",
                                                                        inline: false
                                                                    },
                                                                    {
                                                                        name: 'License',
                                                                        value: "```" + `${key}` + "```",
                                                                        inline: false
                                                                    },
                                                                    {   
                                                                        name: 'Password',
                                                                        value: "```" + pw + "```",
                                                                        inline: false
                                                                    }

                                                                )

                                                                
                                                                
                                                                .setColor(Colors.Green).setTimestamp()],
                                                                ephemeral: true,
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    interaction.editReply({
                                                        embeds: [new EmbedBuilder().setTitle('License Successfully Activated!').setFooter({ text: "KeyAuth Redeem Bot v5.2.2" })
                                                        .addFields(
                                                            { name: 'Username', value: "```" + un + "```", inline: false },
                                                            { name: 'Password', value: "```" + pw + "```", inline: false },
                                                            { name: 'License', value: "```" + `${key}` + "```", inline: false },
                                                            { name: 'Expiry', value: "```" + DaysFromLicense + " Days```", inline: false }
                                                        )
                                                        
                                                        
                                                        
                                                        .setColor(Colors.Green).setTimestamp()],
                                                        ephemeral: true,
                                                    });
                                                }

                                                disableoldlicense();
                                            } else {
                                                interaction.editReply({
                                                    embeds: [new EmbedBuilder().setTitle(json.message).setColor(Colors.Red)],
                                                    ephemeral: true,
                                                });
                                            }
                                        });
                                } else {
                                    interaction.editReply({
                                        embeds: [new EmbedBuilder().setTitle('Something went wrong').setColor(Colors.Red)],
                                        ephemeral: true,
                                    });
                                }
                            });
                    } else {
                        interaction.editReply({
                            embeds: [new EmbedBuilder().setTitle(json.message).setColor(Colors.Red)],
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

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}