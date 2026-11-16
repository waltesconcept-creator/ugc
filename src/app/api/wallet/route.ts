import { NextResponse } from 'next/server';
import {
  getWallet,
  getWalletTransactions,
  requestWithdrawal,
  createCommerceOrder,
} from '@/lib/server-db';
import type { CommerceOrder } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'creator-1';

    const wallet = await getWallet(userId);
    const transactions = await getWalletTransactions(userId);

    return NextResponse.json({
      success: true,
      wallet,
      transactions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    // Action A: Request withdrawal
    if (action === 'withdraw') {
      const { amountNaira, bankDetails } = body;
      const res = await requestWithdrawal(userId || 'creator-1', Number(amountNaira), bankDetails);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.message }, { status: 400 });
      }
      return NextResponse.json(res);
    }

    // Action B: Simulate an instant customer purchase with commission
    if (action === 'simulate_purchase') {
      const order: CommerceOrder = {
        id: `ord-${Date.now()}`,
        productId: body.productId || 'prod-1',
        productTitle: body.productTitle || 'Glow Radiance Vitamin C Body Cream',
        businessId: body.businessId || 'biz-1',
        businessName: body.businessName || 'GlowSkin Organics',
        customerName: body.customerName || 'Bisi Oladipo',
        customerPhone: '+2348023456789',
        customerAddress: 'Lekki Phase 1, Lagos',
        creatorId: body.creatorId || 'creator-1',
        creatorName: body.creatorName || 'Chloe Adams',
        affiliateCode: body.affiliateCode || 'GLOW-CHLOE',
        unitPriceNaira: Number(body.unitPriceNaira) || 20000,
        quantity: 1,
        totalAmountNaira: Number(body.unitPriceNaira) || 20000,
        commissionEarnedNaira: Number(body.commissionEarnedNaira) || 3000,
        status: 'fulfilled',
        createdAt: new Date().toISOString(),
      };

      const savedOrder = await createCommerceOrder(order);
      const updatedWallet = await getWallet(body.creatorId || 'creator-1');
      const updatedTxs = await getWalletTransactions(body.creatorId || 'creator-1');

      return NextResponse.json({
        success: true,
        order: savedOrder,
        wallet: updatedWallet,
        transactions: updatedTxs,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process wallet action' },
      { status: 500 }
    );
  }
}
