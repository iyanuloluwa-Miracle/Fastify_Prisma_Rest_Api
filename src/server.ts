import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fjwt, { JWT } from "fastify/jwt";
import swagger from "fastify-swagger";
import { withRefResolver } from "fastify-zod";
import userRoutes from "./modules/User/user.routes";
import productRoutes from "./modules/product/product.route";
import { userSchemas } from "./modules/User/user.schema";
import { productSchemas } from "./modules/product/product.schema";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();


declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module "fastify-jwt" {
  interface FastifyJWT {
    user: {
      id: number;
      email: string;
      name: string;
    };
  }
}

function buildServer() {
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
    return { status: "OK" };
  });

  server.addHook("preHandler", (req, reply, next) => {
    req.jwt = server.jwt;
    return next();
  });

  for (const schema of [...userSchemas, ...productSchemas]) {
    server.addSchema(schema);
  }

  server.register(
    swagger,
    withRefResolver({
      routePrefix: "/docs",
      exposeRoute: true,
      staticCSP: true,
      openapi: {
        info: {
          title: "Fastify API",
          description: "API for some products",
        },
      },
    })
  );

  server.register(userRoutes, { prefix: "api/users" });
  server.register(productRoutes, { prefix: "api/products" });

  return server;
}

export default buildServer;