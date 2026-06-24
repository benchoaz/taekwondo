import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const belts = await prisma.beltRank.findMany({
      orderBy: { level: 'asc' },
      include: {
        categories: {
          orderBy: { order: 'asc' },
          include: {
            materials: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: belts });
  } catch (error: any) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { action, payload } = data;

    if (action === 'ADD_CATEGORY') {
      const category = await prisma.curriculumCategory.create({
        data: {
          beltId: payload.beltId,
          name: payload.name,
          order: payload.order || 0,
        }
      });
      return NextResponse.json({ success: true, data: category });
    }

    if (action === 'ADD_MATERIAL') {
      const material = await prisma.curriculumMaterial.create({
        data: {
          categoryId: payload.categoryId,
          title: payload.title,
          videoUrl: payload.videoUrl,
          order: payload.order || 0,
        }
      });
      return NextResponse.json({ success: true, data: material });
    }
    
    if (action === 'UPDATE_BELT_REQ') {
      const belt = await prisma.beltRank.update({
        where: { id: payload.beltId },
        data: {
          minAttendance: payload.minAttendance,
          minTechScore: payload.minTechScore,
          minPoomsae: payload.minPoomsae,
          minPhysical: payload.minPhysical,
        }
      });
      return NextResponse.json({ success: true, data: belt });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating curriculum:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
