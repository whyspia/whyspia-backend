tracking thoughts
  [[May 15th, 2024]]
    - socket connection only happens once frontend sees user has JWT (they are logged in) AND they have sent emote saying they are online in parallel (frontend detects when emote sent and just sets state var to true)
    - disconnect of socket connection triggered by closing browser tab, refreshing page, going to new page, logging out
    - on backend detection of disconnect (as captured by the socketio library - uncertain of what it does and doesnt detect) - a timer is set (maybe 10 minutes?) - and if timer ends and user is still disconnected, then we send emote to say user is no longer online in parallel. Otherwise, they reconnected in that time so dont say theyre offline
    - im slightly concerned about what happens if error on server closes socketio connection - will that call disconnect and send emote person is offline even tho they arent?? idk
  [[May 16th, 2024]]
    - DECISION: okay this had been brain fuck - i am making decision that in beginning, if server dies, then it's going to just break things - might send enter or exit emote that doesnt make sense...which sucks.
    - issue: bc on client i have it set reconnection to true, this bug happens: user goes online -> server dies and misses all events -> user goes to page that isnt the parallel context -> server comes back online and socketio is reconnected to that user even tho they are not on valid page. I noticed if user travels to diff pages they stay connected, but if page refresh then they disconnect
    - issue: user goes online -> server dies and misses all events -> user closes browser -> server comes back online -> user still has emote saying they are online, but no emote ever sent saying they are now offline
      - i think the best solution this is: cronjob that runs every hour. pulls list of all online users (sent im online emote to parallel), there is code in backend that stores all userConnects (just like the disconnects var already there), if user reconnected then they would be in userConnects - otherwise they must have went offline after the server went down and no exit emote sent...so send one
    - ISSUE: user goes online -> user's network goes out -> server detects disconnect and sends emote offline -> user's network comes back and socketio reconnects automatically -> no emote sent to say they are back online
      - SOLUTION: on frontend im gonna detect reconnect and send emote for online for that user
  [[May 17th, 2024]]
    - planning for stuff
      - if issue appears where people are sending emote they are active in parallel, but never sending emote they are offline
        - this prob means our server went down and never detected the socketio disconnect. In backend docs, i wrote note for only fix i can think of - which is cronjob to detect these edgecases and send disconnect emote
        - i suppose could also pull online/offline status on frontend and alert user and maybe give option to set offline - or maybe even show this status at all times (but show just on parallel context or where?)
        - can even show different online/offline status for the socketio connection and for the emote data
  [[May 18th, 2024]]
    - due to React's Fast Refresh, if you edit and save useSocketio file - it will always disconnect socketio connection and send emote you disconnected - i couldnt find fix bc we are disconnecting in useeffect cleanup function - we explicitly tell socket to disconnect - this is where it detects user logout - a fix could be to call that disconnect not in cleanup and instead somewhere better - but need access to socket object for that
