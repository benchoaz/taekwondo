import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const filePath = path.join(process.cwd(), "src/data/expenses.json");

// Helper to read expenses
function readExpenses() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Error reading expenses:", error);
    return [];
  }
}

// Helper to write expenses
function writeExpenses(expenses: any[]) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(expenses, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing expenses:", error);
  }
}

export async function GET() {
  try {
    const expenses = readExpenses();
    // Sort by date descending
    expenses.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(expenses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, description, date } = body;

    if (!amount || !description) {
      return NextResponse.json({ error: "Amount and description are required" }, { status: 400 });
    }

    const expenses = readExpenses();
    const newExpense = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    expenses.push(newExpense);
    writeExpenses(expenses);

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

    const expenses = readExpenses();
    const filtered = expenses.filter((e: any) => e.id !== id);
    writeExpenses(filtered);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
