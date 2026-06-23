const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking coaches...");
  let coach = await prisma.coach.findFirst();
  
  if (!coach) {
    console.log("No coaches found. Creating a dummy coach...");
    // Need a user for the coach first
    const user = await prisma.user.create({
      data: {
        email: `coach_${Date.now()}@test.com`,
        password: "hashedpassword",
        role: "COACH"
      }
    });
    coach = await prisma.coach.create({
      data: {
        userId: user.id,
        fullName: "Sabeum Nim Clarissa",
        danRank: "Dan 4",
        specialty: "Kyorugi & Poomsae",
        experience: "10+ Tahun"
      }
    });
  }

  const coach2 = await prisma.coach.findFirst({ skip: 1 }) || coach;

  const schedules = [
    { dayOfWeek: "Senin", startTime: "17:00", endTime: "19:00", className: "Kelas Pemula (Kids)", coachId: coach.id, location: "Dojang Pusat Lt. 1" },
    { dayOfWeek: "Senin", startTime: "19:00", endTime: "21:00", className: "Kelas Dewasa (Adults)", coachId: coach2.id, location: "Dojang Pusat Lt. 2" },
    { dayOfWeek: "Rabu", startTime: "17:00", endTime: "19:00", className: "Kelas Menengah (Teens)", coachId: coach.id, location: "Dojang Pusat Lt. 1" },
    { dayOfWeek: "Kamis", startTime: "16:00", endTime: "18:00", className: "Kelas Pemula (Kids)", coachId: coach.id, location: "Dojang Pusat Lt. 1" },
    { dayOfWeek: "Jumat", startTime: "19:00", endTime: "21:00", className: "Kelas Dewasa (Adults)", coachId: coach2.id, location: "Dojang Pusat Lt. 2" }
  ];

  for (const s of schedules) {
    await prisma.schedule.create({ data: s });
  }

  console.log("Schedules seeded!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
