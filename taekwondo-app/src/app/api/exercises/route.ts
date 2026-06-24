import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    const programs = await prisma.trainingProgram.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (memberId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const logs = await prisma.memberExerciseLog.findMany({
        where: {
          memberId,
          completedAt: {
            gte: today
          }
        }
      });

      return NextResponse.json({ success: true, data: { programs, logs } });
    }

    return NextResponse.json({ success: true, data: programs });
  } catch (error: any) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { action, payload } = data;

    if (action === 'CREATE_PROGRAM') {
      const program = await prisma.trainingProgram.create({
        data: {
          title: payload.title,
          description: payload.description,
          isActive: payload.isActive ?? true,
        }
      });
      return NextResponse.json({ success: true, data: program });
    }

    if (action === 'ADD_EXERCISE') {
      const exercise = await prisma.exercise.create({
        data: {
          programId: payload.programId,
          name: payload.name,
          reps: payload.reps,
          sets: payload.sets,
          order: payload.order || 0,
        }
      });
      return NextResponse.json({ success: true, data: exercise });
    }
    
    // For Flutter Student: Log Exercise
    if (action === 'LOG_EXERCISE') {
      const log = await prisma.memberExerciseLog.create({
        data: {
          memberId: payload.memberId,
          exerciseId: payload.exerciseId,
          notes: payload.notes,
        }
      });
      return NextResponse.json({ success: true, data: log });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating exercises:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
