const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.setting.upsert({
    where: { id: "default" },
    update: {
      dojangName: "WHITE TIGER TAEKWONDO",
      heroTitle: "Bentuk Mental Sang Juara. Lahirkan Macan Putih Sejati.",
      description: "Bukan sekadar tempat berlatih, ini adalah rumah bagi para petarung sejati. Temukan potensi terbaikmu dan jadilah juara bersama keluarga besar White Tiger.",
      address: "Pusat Pelatihan White Tiger, Jakarta Selatan",
      email: "halo@whitetiger-tkd.com",
      registrationFee: 75000
    },
    create: {
      id: "default",
      dojangName: "WHITE TIGER TAEKWONDO",
      heroTitle: "Bentuk Mental Sang Juara. Lahirkan Macan Putih Sejati.",
      description: "Bukan sekadar tempat berlatih, ini adalah rumah bagi para petarung sejati. Temukan potensi terbaikmu dan jadilah juara bersama keluarga besar White Tiger.",
      address: "Pusat Pelatihan White Tiger, Jakarta Selatan",
      email: "halo@whitetiger-tkd.com",
      phone: "+62 811-1234-5678",
      registrationFee: 75000,
      sppFee: 100000,
      sessionFee: 15000,
      uktFee: 150000,
      uktRequirements: ["Surat Izin Orang Tua", "Foto Selfie 3x4"]
    }
  })
  console.log("Settings updated successfully.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
