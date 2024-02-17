thoughts while brainstorming how to do notifications
  - [[February 17th, 2024]]
    - gonna need a new notificiations table
    - gonna need a follow/subscription table - i think i like follow name better in case subscription used later for money thing (mind changed later on this)
    - if symbol sent to user, then they get notification. if spammy, the frontend will fix the spam UX. But, backend will store all sent symbols as much as possible. There will be tight limits in beginning due to money basically - so ill just pick a limit and when hit - the sending user will no longer be able to send symbols.
    - what about if symbol is sent that user follows? this made me realize i dont think follows are needed - at least in beginning
    - instead of follows, there will be notification button on symbol of user where you can change how you receive that symbol from that user. default is to receive all. Really this would just be setting in DB that controls frontend UX - but no data storage of notifs is really changing.
    - i guess ill do notification viewed functionality same way X does it. Something about it i dont like, but seems easiest
    - for now, this notification table will only store notifs for emotes. one day there will be notifs for other things to. maybe ill name emotenotif then to prepare
    
