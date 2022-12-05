import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import convert from 'koa-convert'
import cors from 'koa-cors'
import * as Sentry from '@sentry/node'

const app = new Koa()
const router = new Router()

app.use(bodyParser())
app.use(convert(cors({ maxAge: 86400, credentials: true })))

Sentry.init({
  dsn: process.env.SENTRY_DSN
})

app.on('error', (err, ctx) => {
  Sentry.withScope(function (scope) {
    scope.addEventProcessor(function (event) {
      return Sentry.addRequestDataToEvent(event, ctx.request)
    })
    Sentry.captureException(err)
  })
})

router.get('/', async ctx => {
  ctx.status = 200
  ctx.body = 'status -> running'
})

app.use(router.routes()).use(router.allowedMethods())

export default app
