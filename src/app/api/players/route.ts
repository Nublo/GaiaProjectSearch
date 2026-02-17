import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const rows = await prisma.player.findMany({
      select: { playerName: true },
      distinct: ['playerName'],
      orderBy: { playerName: 'asc' },
    });
    return NextResponse.json(rows.map((r: { playerName: string }) => r.playerName));
  } catch (error) {
    console.error('Failed to fetch player names:', error);
    return NextResponse.json([], { status: 500 });
  }
}
