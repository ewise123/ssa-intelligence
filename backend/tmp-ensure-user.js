const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  await p.user.upsert({
    where: { id: "demo-user" },
    update: {},
    create: { id: "demo-user", email: "demo@example.com", name: "Demo User" }
  });
  console.log("demo user ensured");
  await p.$disconnect();
})();
