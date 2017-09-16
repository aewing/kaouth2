const Koa = require("koa");
const oauth = require("../src");

const app = new Koa();
app.use(
  oauth({
    models: {
      user: User,
      client: Client,
      token: Token
    }
  })
);

app.listen(3000);
