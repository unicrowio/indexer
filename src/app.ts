import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";

const app = new Koa();
const router = new Router();

app.use(bodyParser({ jsonLimit: "1mb" }));

router.get("/", async (ctx) => {
  ctx.status = 200;
  ctx.body = "status -> running";
});

app.use(router.routes()).use(router.allowedMethods());

export default app;
