import "dotenv/config";
import app from './app';
import prisma from './config/prisma';


const PORT = parseInt(process.env.PORT);

async function main() {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
