const Discord = require('discord.js');
const db = require('quick.db');
const { default_prefix } = require('./../config.json')

module.exports = {
    name: "help",
    description: "The help command, what do you expect?",

    async run (client, message) {

        let prefix = await db.get(`prefix_${message.guild.id}`);
        if(prefix === null) prefix = default_prefix;

        const embed = new Discord.MessageEmbed()
        .setTitle('Redeem Help')
        .addField('`redeem`', `Redeem a License. \nArgs: **${prefix}redeem**`, true)
        .setFooter('KeyAuth Redeem Bot', client.user.displayAvatarURL())
        .setTimestamp()

        message.channel.send(embed)
        
    }
}

