import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  let messages = [];
  try {
    const updatedBelts = await prisma.member.updateMany({
      where: { currentBelt: 'Sabuk Sabuk Merah (2 Geup)' },
      data: { currentBelt: 'Sabuk Merah (2 Geup)' }
    });
    messages.push(`Updated ${updatedBelts.count} duplicate belt names.`);

    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deletedLogs = await prisma.dailyQuestLog.deleteMany({
      where: { assignedAt: { gte: today, lt: tomorrow } }
    });
    messages.push(`Deleted ${deletedLogs.count} empty quest logs for today.`);

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
