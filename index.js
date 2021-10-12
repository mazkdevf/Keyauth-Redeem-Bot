const Discord = require('discord.js');

const client = new Discord.Client();

const { token, default_prefix } = require('./config.json');

const config = require('./config.json');
client.config = config;

const db = require('quick.db')

const { readdirSync } = require('fs');

const { join } = require('path');


client.commands= new Discord.Collection();
const commandFiles = readdirSync(join(__dirname, "commands")).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(join(__dirname, "commands", `${file}`));
    client.commands.set(command.name, command);
}


client.on("error", console.error);

client.on('ready', () => {
    console.clear();
    console.log("Logged in as:", client.user.tag)
   client.user.setActivity(".help | keyauth.com");  
});

client.on("message", async message => {

let prefix = await db.get(`prefix_${message.guild.id}`);
if(prefix === null) prefix = default_prefix;

    if (message.author.bot) return false;

    if (message.content.includes("@here") || message.content.includes("@everyone")) return false;

    if (message.mentions.has(client.user.id)) {
        const embed = new Discord.MessageEmbed()
        .setTitle('Redeem Help')
        .addField('`redeem`', `Redeem a License. \nArgs: **${prefix}redeem**`, true)
        .setFooter('KeyAuth Redeem Bot', client.user.displayAvatarURL())
        .setTimestamp()

        message.channel.send(embed)
    };

    if(message.content.startsWith(prefix)) {

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        client.commands.get(command).run(client, message, args);
    }

})


client.login(token);

    
