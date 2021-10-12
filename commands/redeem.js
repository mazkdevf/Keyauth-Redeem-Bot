const db = require('quick.db')
const fetch = require('node-fetch')
const Discord = require('discord.js');

const { Client, MessageAttachment } = require('discord.js');

module.exports = {
    name: "redeem",
    description: "Redeem a license",

    async run (client, message) {

    let sellerkey = await db.get(`token_${message.guild.id}`)
    if(sellerkey === null) return message.channel.send(new Discord.MessageEmbed().setDescription(`Seller key haven't been setupped!`).setColor("RED").setTimestamp());


        let filteeer = m => m.author.id === message.author.id
      message.channel.send(new Discord.MessageEmbed().setTitle('License Key:').setColor("RED")).then(() => {
      message.channel.awaitMessages(filteeer, {
          max: 1,
          time: 30000,
          errors: ['time']
        })
        .then(message => {
          message = message.first()
          let key = message.content;
	function checkResponseStatus(res) {
    if(res.ok){ 
        if(message.author.id == message.author.id){
            message.delete()
        }
        let role = message.member.guild.roles.cache.find(r => r.id === "RoleID");
        if (role) message.guild.members.cache.get(message.author.id).roles.add(role);
        message.author.send(new Discord.MessageEmbed().setTitle('License Successfully Activated!').setColor("GREEN"))
        return;
    } else {
        if(message.author.id == message.author.id){
            message.delete()
        }
        message.channel.send(new Discord.MessageEmbed().setTitle('License Key Not Found').setColor("RED"))
        return;
    }
}

    fetch(`https://keyauth.com/api/seller/?sellerkey=${sellerkey}&type=del&key=${key}&format=text`)
    .then(checkResponseStatus);

        })
        .catch(collected => {
            return message.channel.send(new Discord.MessageEmbed().setTitle('Fail, next time be faster!').setColor("RED"));
        });
    })

    }
}
