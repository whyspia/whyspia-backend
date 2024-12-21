import { Router } from 'express'

import { generalRouter } from './general'
import { userV2TokenRouter } from './user-v2'
import { symbolRouter } from './symbol'
import { symbolDefinitionRouter } from './symbol-definition'
import { emoteRouter } from './emote'
import { emoteNotifRouter } from './emote-notif'
import { pingpplContextRouter } from './pingppl-context'
import { tauRouter } from './tau'
import { savedPersonRouter } from './saved-person'
import { currentlyRouter } from './currently'

const routes = Router()

// routers
routes.use('/general', generalRouter)
routes.use('/user-v2', userV2TokenRouter)
routes.use('/symbol', symbolRouter)
routes.use('/symbol-definition', symbolDefinitionRouter)
routes.use('/emote', emoteRouter)
routes.use('/emote-notif', emoteNotifRouter)
routes.use('/pingppl', pingpplContextRouter)
routes.use('/tau', tauRouter)
routes.use('/saved-person', savedPersonRouter)
routes.use('/currently', currentlyRouter)

export { routes }
