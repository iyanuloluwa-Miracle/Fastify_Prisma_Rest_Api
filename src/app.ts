import Fastify from "fastify";
import userRoutes from "./modules/User/user.routes";

const server = Fastify();

server.get("/healthcheck", async function () {
  return { status: "OK💀" };
});

async function main() {
  server.register(userRoutes, { prefix: "api/users" });
  try {
    await server.listen(3000, "0.0.0.0");
    console.log(`Server ready at http://localhost:3000`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
