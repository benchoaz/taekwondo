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
            materials: { orderBy: { order: 'asc' } }
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
    const { action, payload } = await req.json();

    // ── Belt CRUD ─────────────────────────────────────────────────
    if (action === 'CREATE_BELT') {
      const belt = await prisma.beltRank.create({
        data: {
          name: payload.name,
          level: Number(payload.level),
          imageUrl: payload.imageUrl || null,
          minAttendance: Number(payload.minAttendance ?? 80),
          minTechScore:  Number(payload.minTechScore  ?? 70),
          minPoomsae:    Number(payload.minPoomsae    ?? 70),
          minPhysical:   Number(payload.minPhysical   ?? 70),
        }
      });
      return NextResponse.json({ success: true, data: belt });
    }

    if (action === 'UPDATE_BELT') {
      const belt = await prisma.beltRank.update({
        where: { id: payload.beltId },
        data: {
          name:          payload.name,
          level:         Number(payload.level),
          minAttendance: Number(payload.minAttendance),
          minTechScore:  Number(payload.minTechScore),
          minPoomsae:    Number(payload.minPoomsae),
          minPhysical:   Number(payload.minPhysical),
        }
      });
      return NextResponse.json({ success: true, data: belt });
    }

    if (action === 'DELETE_BELT') {
      await prisma.beltRank.delete({ where: { id: payload.beltId } });
      return NextResponse.json({ success: true });
    }

    if (action === 'UPDATE_BELT_IMAGE') {
      const belt = await prisma.beltRank.update({
        where: { id: payload.beltId },
        data: { imageUrl: payload.imageUrl } as any
      });
      return NextResponse.json({ success: true, data: belt });
    }

    // legacy – keep backward compat for BeltRequirementBuilder
    if (action === 'UPDATE_BELT_REQ') {
      const belt = await prisma.beltRank.update({
        where: { id: payload.beltId },
        data: {
          minAttendance: Number(payload.minAttendance),
          minTechScore:  Number(payload.minTechScore),
          minPoomsae:    Number(payload.minPoomsae),
          minPhysical:   Number(payload.minPhysical),
        }
      });
      return NextResponse.json({ success: true, data: belt });
    }

    // ── Category CRUD ─────────────────────────────────────────────
    if (action === 'ADD_CATEGORY') {
      const category = await prisma.curriculumCategory.create({
        data: {
          beltId: payload.beltId,
          name:   payload.name,
          order:  payload.order ?? 0,
        }
      });
      return NextResponse.json({ success: true, data: category });
    }

    if (action === 'UPDATE_CATEGORY') {
      const category = await prisma.curriculumCategory.update({
        where: { id: payload.categoryId },
        data:  { name: payload.name }
      });
      return NextResponse.json({ success: true, data: category });
    }

    if (action === 'DELETE_CATEGORY') {
      await prisma.curriculumCategory.delete({ where: { id: payload.categoryId } });
      return NextResponse.json({ success: true });
    }

    // ── Material CRUD ─────────────────────────────────────────────
    if (action === 'ADD_MATERIAL') {
      const material = await prisma.curriculumMaterial.create({
        data: {
          categoryId: payload.categoryId,
          title:      payload.title,
          videoUrl:   payload.videoUrl || null,
          order:      payload.order ?? 0,
        }
      });
      return NextResponse.json({ success: true, data: material });
    }

    if (action === 'UPDATE_MATERIAL') {
      const material = await prisma.curriculumMaterial.update({
        where: { id: payload.materialId },
        data:  { title: payload.title, videoUrl: payload.videoUrl || null }
      });
      return NextResponse.json({ success: true, data: material });
    }

    if (action === 'DELETE_MATERIAL') {
      await prisma.curriculumMaterial.delete({ where: { id: payload.materialId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in curriculum POST:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
