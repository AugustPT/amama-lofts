import { NextRequest, NextResponse } from 'next/server';
import { getLeads, dbMode } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const password = searchParams.get('password');

    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid admin password.' },
        { status: 401 }
      );
    }

    const leads = await getLeads();
    const mode = dbMode();

    return NextResponse.json({
      success: true,
      database_mode: mode,
      leads,
    }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch leads.';
    console.error('Admin leads fetch error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
