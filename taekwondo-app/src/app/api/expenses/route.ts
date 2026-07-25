import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(expenses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, description, date, recordedBy } = body;

    if (!amount || !description) {
      return NextResponse.json({ error: "Amount and description are required" }, { status: 400 });
    }

    const userHeaderId = request.headers.get("x-user-id");
    let adminName = recordedBy;
    if (!adminName && userHeaderId) {
      const user = await prisma.user.findUnique({
        where: { id: userHeaderId },
        select: { name: true, email: true }
      });
      if (user) adminName = user.name || user.email;
    }

    const newExpense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
        recordedBy: adminName || "Admin Bendahara"
      }
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query param is required" }, { status: 400 });
    }

    await prisma.expense.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
