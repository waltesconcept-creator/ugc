import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/server-db';
import type { Product } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || undefined;
    const products = await getProducts(businessId);
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.priceNaira) {
      return NextResponse.json(
        { success: false, error: 'Product title and price in Naira are required' },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      businessId: body.businessId || 'biz-custom',
      businessName: body.businessName || 'My Brand',
      businessLogo: body.businessLogo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
      title: body.title,
      description: body.description || '',
      priceNaira: Number(body.priceNaira),
      compareAtPriceNaira: body.compareAtPriceNaira ? Number(body.compareAtPriceNaira) : undefined,
      mediaUrls: body.mediaUrls && body.mediaUrls.length > 0 ? body.mediaUrls : ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop'],
      category: body.category || 'Lifestyle',
      stockCount: Number(body.stockCount) || 100,
      isAvailable: true,
      sampleAvailable: Boolean(body.sampleAvailable),
      deliveryInfo: body.deliveryInfo || 'Standard nationwide delivery (2-4 business days)',
      commissionPercent: Number(body.commissionPercent) || 15,
      createdAt: new Date().toISOString(),
    };

    const saved = await createProduct(newProduct);
    return NextResponse.json({ success: true, product: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
