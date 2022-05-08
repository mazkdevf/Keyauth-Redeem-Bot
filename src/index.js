const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents, Collection, MessageEmbed } = require("discord.js");

/// Discord Client Configuration ///
const client = new Client({
    messageCacheMaxSize: 1000,
    messageCacheLifetime: 43200,
    messageSweepInterval: 3600,
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.DIRECT_MESSAGES
    ]
})

/// Discord Token and Server - Guild ID ///
let conf = {
    token: "", // Discord Bot Token (https://discord.com/developers/applications/)
    GuildID: "", // GuildID Where Bot will put commands.
}


/// Client Setup ///
client.domain = "win"; // KeyAuth Domain [win Currently]
client.customer_id = ""; // What user get when /redeem <key> have been used
client.admin_role_id = ""; // Admin Role id to /rlogs + to access logs channel.


const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))
const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command)
}

client.on("error", console.error);

client.once('ready', async () => {
    console.clear();
    logo();
    sysTitle("KeyAuth Redeem Bot - Started | https://github.com/mazk5145");
    console.log(`\x1b[33m[DiscordJS] \x1b[0mBot Started - ${client.user.tag}`)

    const CLIENT_ID = client.user.id;

    const rest = new REST({
        version: "9"
    }).setToken(conf.token);

    (async () => {
        try {
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, conf.GuildID), {
                body: commands
            })
            console.log(`\x1b[32m[CMDS] \x1b[0mCommands have been setup for GuildID: ${conf.GuildID}`)
        } catch (err) {
            console.error(err);
        }
    })();

    client.user.setPresence({
        activities: [
            {
                name: "KeyAuth Redeem Bot - github.com/mazk5145",
                type: "WATCHING",
            }
        ],
    })

});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    const errorembed = new MessageEmbed()
        .setAuthor({ name: "Interaction Failed" })
        .setColor("RED")
        .setTimestamp()
        .setFooter({ text: "KeyAuth Redeem Bot v1.6.2" })


    try {
        await command.execute(interaction, client);
    } catch (err) {
        if (err) console.error(err);

        await interaction.reply({
            embeds: [errorembed],
            ephemeral: true
        })
    }
});

//Console Logo
function logo() {
    console.log();
    console.log("\x1b[35m");
    console.log("                       ██╗  ██╗███████╗██╗   ██╗ █████╗ ██╗   ██╗████████╗██╗  ██╗██████╗ ██████╗ ");
    console.log("                       ██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔══██╗██║   ██║╚══██╔══╝██║  ██║██╔══██╗██╔══██╗");
    console.log("                       █████╔╝ █████╗   ╚████╔╝ ███████║██║   ██║   ██║   ███████║██████╔╝██████╔╝");
    console.log("                       ██╔═██╗ ██╔══╝    ╚██╔╝  ██╔══██║██║   ██║   ██║   ██╔══██║██╔══██╗██╔══██╗");
    console.log("                       ██║  ██╗███████╗   ██║   ██║  ██║╚██████╔╝   ██║   ██║  ██║██║  ██║██████╔╝");
    console.log("                       ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ");
    console.log("\x1b[0m\n");
}

// Change Console Title
function sysTitle(title) {
    process.stdout.write(
        String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
    );
}

client.login(conf.token);


