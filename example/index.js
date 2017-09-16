const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const koauth = require("../src");

const User = require("./models/user").User;
const Token = require("./models/token").Token;
const Client = require("./models/client").Client;

const app = new Koa();
const router = new Router();

app.use(bodyParser());

const auth = koauth({
  models: {
    user: User,
    client: Client,
    token: Token
  }
});
app.use(auth.middleware);

router.get("/", function(ctx) {
  ctx.body = { hello: "world" };
});

router.post("/login", async function(ctx) {
  let email = ctx.request.body.email || ctx.request.body.username || "";
  ctx.body = await ctx.login(email, ctx.request.body.password);
});

router.get("/protected", auth.required, function(ctx) {
  ctx.body = {
    protected: true,
    user: ctx.user,
    token: ctx.token
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Starting Koa server at http://localhost:3000/");
app.listen(3000);
