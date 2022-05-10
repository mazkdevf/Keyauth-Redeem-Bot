## KeyAuth Redeem Bot - V13

Created for application resellers/sellers so users can redeem licenses to get role or user and password from the key.

<details>
<summary>Showcase Pictures</summary>
  
![](photos/pic4.png "Logs")
![](photos/pic1.png "When user redeemed")
![](photos/pic2.png "License redeemed")
![](photos/pic3.png "Logging enabled")
</details>

###### Requirements

```md
Latest NodeJS
Discord Bot
KeyAuth Seller Plan / Subscription
```

###### Setup

###### Discord Developer Portal
`https://discord.com/api/oauth2/authorize?client_id=<CLIENTID>&permissions=8&scope=bot%20applications.commands`
```js
#1: When inviting bot use this but replace <CLIENTID> ^^^^ with your bot ID
#2: When you have done inviting do this step on discord oauth bot tab: https://i.imgur.com/lZvyONH.png
#3: And bot should now have permission to put commands on that server.
```

###### Discord Bot Source
```md
#1: Install the Latest Version of the Main Branch
#2: Open folder/src folder
#3: Drag files inside that to any folder
#4: Open Index.js with the code editor of your choice
#5: Change 20 and 28-29 lines.
#6: open cmd to that folder and run this npm install
#7: then you can run the bot with node . or node filename.js
```
