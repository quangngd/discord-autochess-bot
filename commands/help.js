exports.run = (client, message, args) => {
  message.channel.send(`
!ping,
!link : check if your discord has been linked with your steam
!link @user : check if @user's discord has been linked with their steam
!link relink: resend the linking link to update in case of changing steam
!rank : check your rank
!rank @user: check @user's rank
!rank steamId: check steamId's rank
  `);
};
