# Discord Autochess Bot

An lightweight discord bot for autochess server

## Features

- !gg !ping
- !link [SteamId] : link your current Discord account with a Steam id (*)
- !rank : check your rank with linked Steam id
- !rank [SteamId] : check your rank with given Steam id
- !rank [@user] : check @user's rank

## Installation

Install the dependencies and start the server!

```sh
$ npm install
$ npm start [yourBotToken]
```

## Note
The project is currently utilizing a somewhat inefficient and primative data storing approach.
Feel free to modify the code to fit your DBMS in the *ultilities/db.js.*