import { Router } from 'express'

import { generalRouter } from './general'
import { userTokenRouter } from './user-token'
import { symbolRouter } from './symbol'
import { symbolDefinitionRouter } from './symbol-definition'
import { emoteRouter } from './emote'
import { emoteNotifRouter } from './emote-notif'
import { parallelRouter } from './parallel-context'
import { pingpplContextRouter } from './pingppl-context'

const routes = Router()

// Routers
routes.use('/general', generalRouter)
routes.use('/user-token', userTokenRouter)
routes.use('/symbol', symbolRouter)
routes.use('/symbol-definition', symbolDefinitionRouter)
routes.use('/emote', emoteRouter)
routes.use('/emote-notif', emoteNotifRouter)
routes.use('/parallel', parallelRouter)
routes.use('/pingppl', pingpplContextRouter)

export { routes }
