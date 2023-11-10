import { Router } from 'express'

import { categoryRouter } from './category'
import { generalRouter } from './general'
import { userTokenRouter } from './user-token'
import { symbolRouter } from './symbol'
import { symbolDefinitionRouter } from './symbol-definition'
import { emoteRouter } from './emote'

const routes = Router()

// Routers
routes.use('/category', categoryRouter)
routes.use('/general', generalRouter)
routes.use('/user-token', userTokenRouter)
routes.use('/symbol', symbolRouter)
routes.use('/symbol-definition', symbolDefinitionRouter)
routes.use('/emote', emoteRouter)

export { routes }
