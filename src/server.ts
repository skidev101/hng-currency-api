import "dotenv/config";
import app from './app.js';
import prisma from './config/prisma.js';


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
