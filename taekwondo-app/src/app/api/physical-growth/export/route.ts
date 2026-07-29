import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const allMembers = await prisma.member.findMany({
      include: {
        physicalLogs: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        }
      },
      orderBy: { fullName: 'asc' }
    });

    let csvContent = "No,ID Anggota,Nama Atlet,Sabuk,Tinggi (cm),Berat (kg),BMI,Status Kesehatan,Kategori Kelas Turnamen,Tanggal Update\n";

    allMembers.forEach((m, idx) => {
      const log = m.physicalLogs[0] || null;
      const weight = log?.weight || "-";
      const height = log?.height || "-";
      
      let bmi = "-";
      let status = "Belum Ada Data";
      let tournamentClass = "Belum Ada Data";

      if (log?.weight && log?.height) {
        const heightM = log.height / 100;
        const bmiVal = parseFloat((log.weight / (heightM * heightM)).toFixed(1));
        bmi = bmiVal.toString();

        if (bmiVal < 18.5) status = "Underweight";
        else if (bmiVal <= 22.9) status = "Ideal";
        else if (bmiVal <= 24.9) status = "Overweight";
        else status = "Obesity";

        const w = log.weight;
        if (w <= 33) tournamentClass = "Under 33 kg";
        else if (w <= 37) tournamentClass = "Under 37 kg";
        else if (w <= 41) tournamentClass = "Under 41 kg";
        else if (w <= 45) tournamentClass = "Under 45 kg";
        else if (w <= 48) tournamentClass = "Under 48 kg";
        else if (w <= 51) tournamentClass = "Under 51 kg";
        else if (w <= 55) tournamentClass = "Under 55 kg";
        else if (w <= 59) tournamentClass = "Under 59 kg";
        else if (w <= 63) tournamentClass = "Under 63 kg";
        else if (w <= 68) tournamentClass = "Under 68 kg";
        else if (w <= 73) tournamentClass = "Under 73 kg";
        else tournamentClass = `Over ${Math.floor(w)} kg`;
      }

      const dateStr = log?.recordedAt ? new Date(log.recordedAt).toISOString().split('T')[0] : "-";
      const nameEscaped = `"${m.fullName.replace(/"/g, '""')}"`;

      csvContent += `${idx + 1},${m.memberNumber},${nameEscaped},"${m.currentBelt}",${height},${weight},${bmi},"${status}","${tournamentClass}",${dateStr}\n`;
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Laporan_Tumbuh_Kembang_Dan_Turnamen_WTK.csv"',
      },
    });
  } catch (error: any) {
    console.error("Export Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
