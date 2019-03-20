# Discord Autochess Bot

An lightweight discord bot for autochess server

## Features

1. !help         : display help
2. !ping         : pong!
3. !link
   * !link       : check if your discord has been linked with your steam
   * !link __@user__ : check if @user's discord has been linked with their steam
   * !link relink: resend the linking link to update in case of changing steam
4. !rank
    * !rank      : check your rank
    * !rank __@user__: check @user's rank
    * !rank __steamId__: check rank of a steam account given Id
5. !lobby (used to find room)
    * !lobby: list all suitable rooms for you
        * !lobby list
    * !lobby list all: list room in the whole guild
    * !lobby create: create a new room for you. Allow people within 4 ranks above or below you to join.
        * !lobby new
    * !lobby create __rank_range__: create room with customize rank range (base rank is yours)
        * lobby new  __rank_range__
    * !lobby join __roomId__: join a room based on the room id.
    * !lobby join __@user__: join a room which @user is in
6. !room (used when in room)
    * !room: display the room's info
        * !room info
        * !room pass, !room password, !room list, !room player: display corresponding info
    * !room leave: leave the current room
    * !room done: delete the room when game has started

## Before installation

This implementation makes use of Discord's oauth2, autochess-stats API and a custom database endpoint to retrieve user's Discord's connections, autochess rank and store it in a database.

It is recommended to reimplement the database part. You can find those in ./utilities/db.js.

Set up your bot for [Oauth2](https://discordapp.com/developers/docs/topics/oauth2).
Fill the .env file.

## Installation

* Reimplement db.js
* Fill .env file
* Install the dependencies and start the server!

```sh
$ npm install
$ npm start
```

## TODO
* improve display