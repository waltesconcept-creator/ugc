import { NextResponse } from 'next/server';
import {
  getCampaigns,
  createCampaign,
  applyToCampaign,
  getCreatorApplications,
  updateApplicationStatus,
  getProductById,
} from '@/lib/server-db';
import type { AffiliateCampaign, CreatorApplication } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || undefined;
    const creatorId = searchParams.get('creatorId') || undefined;

    const campaigns = await getCampaigns(businessId);
    let applications: CreatorApplication[] = [];

    if (businessId) {
      applications = await getCreatorApplications(undefined, undefined, businessId);
    } else if (creatorId) {
      applications = await getCreatorApplications(creatorId);
    }

    return NextResponse.json({
      success: true,
      campaigns,
      applications,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action A: Create new affiliate campaign
    if (action === 'create_campaign') {
      const product = await getProductById(body.productId);
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      const commissionPercent = Number(body.commissionPercent) || product.commissionPercent || 15;
      const commissionAmountNaira = Math.round((product.priceNaira * commissionPercent) / 100);

      const newCampaign: AffiliateCampaign = {
        id: `camp-${Date.now()}`,
        productId: product.id,
        product,
        businessId: product.businessId,
        businessName: product.businessName,
        commissionPercent,
        commissionAmountNaira,
        sampleRequiresApproval: Boolean(body.sampleRequiresApproval),
        sampleStock: Number(body.sampleStock) || 20,
        terms: body.terms || 'Post 1 authentic review or showcase video with affiliate link.',
        active: true,
        totalCreatorsCount: 0,
        totalSalesCount: 0,
        totalRevenueNaira: 0,
        createdAt: new Date().toISOString(),
      };

      const saved = await createCampaign(newCampaign);
      return NextResponse.json({ success: true, campaign: saved });
    }

    // Action B: Creator applies to promote campaign / request sample
    if (action === 'apply') {
      if (!body.campaignId || !body.creatorId) {
        return NextResponse.json(
          { success: false, error: 'campaignId and creatorId are required' },
          { status: 400 }
        );
      }

      const application: CreatorApplication = {
        id: `app-${Date.now()}`,
        campaignId: body.campaignId,
        creatorId: body.creatorId,
        creatorName: body.creatorName || 'Creator',
        creatorAvatar: body.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        creatorCategory: body.creatorCategory || 'Beauty & Lifestyle',
        creatorFollowers: body.creatorFollowers || '18.4K',
        productTitle: body.productTitle || '',
        shippingAddress: body.shippingAddress || 'Lagos, Nigeria',
        status: body.autoApprove ? 'approved' : 'pending',
        sampleRequested: Boolean(body.sampleRequested ?? true),
        sampleStatus: body.autoApprove ? 'shipped' : 'processing',
        affiliateCode: `REF-${body.creatorName?.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'CREATOR'}-${Math.floor(100 + Math.random() * 900)}`,
        appliedAt: new Date().toISOString(),
        notes: body.notes || 'Excited to review and promote this product in high-converting UGC reels!',
      };

      const savedApp = await applyToCampaign(application);
      return NextResponse.json({ success: true, application: savedApp });
    }

    // Action C: Business approves creator application & ships sample
    if (action === 'approve_application') {
      if (!body.applicationId) {
        return NextResponse.json({ success: false, error: 'applicationId is required' }, { status: 400 });
      }
      const updated = await updateApplicationStatus(body.applicationId, 'approved');
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, application: updated });
    }

    // Action D: Business rejects creator application
    if (action === 'reject_application') {
      if (!body.applicationId) {
        return NextResponse.json({ success: false, error: 'applicationId is required' }, { status: 400 });
      }
      const updated = await updateApplicationStatus(body.applicationId, 'rejected', body.notes);
      return NextResponse.json({ success: true, application: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
