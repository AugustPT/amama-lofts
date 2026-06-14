import { NextRequest, NextResponse } from 'next/server';
import { authorizeLeadTransfer } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId } = body;
    
    if (!leadId) {
      return NextResponse.json(
        { error: 'Missing leadId parameter.' },
        { status: 400 }
      );
    }
    
    const success = await authorizeLeadTransfer(leadId);
    if (!success) {
      return NextResponse.json(
        { error: 'Lead not found or update failed.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('API lead transfer update error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update transfer authorization.' },
      { status: 500 }
    );
  }
}
