import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // For Prisma 7 CLI, use the POOLED connection (port 6543)
    url: env("DATABASE_URL"), 
  },
});