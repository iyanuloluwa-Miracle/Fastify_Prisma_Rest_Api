import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fjwt from 'fastify-jwt';
import userRoutes from "./modules/User/user.routes";
import { userSchemas } from "./modules/User/user.schema";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();


const server = Fastify();

server.register(fjwt,{
  secret: process.env.JWT_SECRET
})

  server.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (e) {
        return reply.send(e);
      }
    }
  );

server.get("/healthcheck", async function () {
  return { status: "OK💀" };
});

async function main() {


  for(const schema of userSchemas){
    server.addSchema(schema)
  }
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
