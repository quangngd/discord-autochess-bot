# Discord Autochess Bot

An lightweight discord bot for autochess server

## Features

1. !ping
2. !link
   * !link       : check if your discord has been linked with your steam
   * !link @user : check if @user's discord has been linked with their steam
   * !link relink: resend the linking link to update in case of changing steam
3. !rank
    * !rank      : check your rank
    * !rank @user: check @user's rank
    * !rank steamId

## Before installation

This implementation makes use of Discord's oauth2, autochess-stats API and a custom database endpoint to retrieve user's Discord's connections, autochess rank and store it in a database.

It is recommended to reimplement the database part. You can find those in ./utilities/db.js.

Set up your bot for [Oauth2](https://discordapp.com/developers/docs/topics/oauth2). Place the authorizing URL in .env file at ./".env"

### Sample .env

```.env
TOKEN=(your bot token)
LINK_URL=(your authorizing url)
DB_GET_URL=(database endpoint used in db.js, erase if not needed in your implementation)
DAC_API=http://www.autochess-stats.com/backend/api/dacprofiles/
```

## Installation

* Reimplement db.js
* Create .env file
* Install the dependencies and start the server!

```sh
$ npm install
$ npm start
```

## TODO
* Lobby feature
