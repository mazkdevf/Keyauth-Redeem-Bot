const fs = require("fs");
const { REST, Client, GatewayIntentBits, ActivityType, Collection, EmbedBuilder, Routes, Partials, Colors, Events } = require("discord.js");

/// Discord Client Configuration ///
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ],
    partials: [Partials.Channel]
})


/// Discord Token and Server - Guild ID ///
let conf = {
    token: "", // Discord Bot Token (https://discord.com/developers/applications/)
    GuildID: "", // GuildID Where Bot will put commands.
}


/// Client Setup ///
client.domain = "win"; // KeyAuth Domain [win Currently]
client.customer_id = ""; // What user get when /redeem <key> have been used visit redeem.js if you want to add more roles.
client.admin_role_id = ""; // Admin Role id to /rlogs + to access logs channel.
client.use_once = true; // only allow members to use a license key once. set to false if you'd like people to be able to use multiple times


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
    await protyperxdd(logo(), 0);
    sysTitle("KeyAuth Redeem Bot - Started | https://github.com/mazkdevf");
    console.log(`\x1b[33m[discord.js] \x1b[0mBot Started - ${client.user.tag}`)

    const CLIENT_ID = client.user.id;

    const rest = new REST({}).setToken(conf.token);

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
                name: "KeyAuth Redeem Bot - github.com/mazkdevf",
                type: ActivityType.COMPETING,
            }
        ],
    })

});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.type === 2) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    const ErrorEmbed = new EmbedBuilder()
        .setAuthor({ name: "Interaction Failed" })
        .setColor(Colors.Red)
        .setFooter({ text: "KeyAuth Redeem Bot v5.2.2" })

    client.user.setPresence({
        activities: [
            {
                name: "KeyAuth Redeem Bot - github.com/mazkdevf",
                type: ActivityType.COMPETING,
            }
        ],
    })

    try {
        await command.execute(interaction, client);
    } catch (err) {
        if (err) console.error(err);

        await interaction.editReply({
            embeds: [ErrorEmbed],
            ephemeral: true
        })
    }
});

function logo() {
    var lol = `
    \x1b[37m:::  === :::===== \x1b[34m::: === \x1b[37m:::====  :::  === :::==== :::  === :::====  :::==== 
    \x1b[37m::: ===  :::      \x1b[34m::: === \x1b[37m:::  === :::  === :::==== :::  === :::  === :::  ===
    \x1b[34m======   ======    =====  ======== ===  ===   ===   ======== =======  ======= 
    \x1b[37m=== ===  ===      \x1b[34m  ===   \x1b[37m===  === ===  ===   ===   ===  === === ===  ===  ===
    \x1b[37m===  === ======== \x1b[34m  ===   \x1b[37m===  ===  ======    ===   ===  === ===  === =======
    \n\n`;
    return lol;
}


// Change Console Title
function sysTitle(title) {
    process.stdout.write(
        String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
    );
}

// Sleep
async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// Typerwriter
async function protyperxdd(text, ms = 20) {
    for (const c of text) {
        process.stdout.write(c);
        await sleep(ms);
    }
}

client.login(conf.token);


