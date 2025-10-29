import "dotenv/config";
import app from "./app";
import prisma from "./config/prisma";


const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function main() {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
