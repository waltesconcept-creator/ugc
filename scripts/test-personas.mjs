// Automated End-to-End Persona Verification Test
// Tests: Creator, Business, and Consumer (User) personas across TikTok Shop & UGC Workflows

import {
  getDb,
  getProducts,
  createProduct,
  getCreatorApplications,
  createCreatorApplication,
  updateApplicationStatus,
  getWallet,
  createCommerceOrder,
  getWalletTransactions,
  requestWithdrawal,
  createReview,
  getReviewsByCreatorId
} from '../src/lib/server-db.ts';

async function runPersonaTestSuite() {
  console.log('====================================================');
  console.log('🚀 STARTING MULTI-PERSONA RIGOROUS PLATFORM TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ────────────────────────────────────────────────────────────────
  // PERSONA 2: BUSINESS CREATES A PRODUCT WITH SAMPLE STOCK & COMMISSIONS
  // ────────────────────────────────────────────────────────────────
  console.log('📦 [PERSONA: BUSINESS] Listing Product & Campaign');
  const testBusinessId = 'biz-glow-organics';
  const newProduct = await createProduct({
    id: `prod-test-${Date.now()}`,
    businessId: testBusinessId,
    businessName: 'GlowSkin Organics',
    businessLogo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    title: 'Whipped Shea & Vitamin C Brightening Butter',
    description: '100% cold-pressed organic skincare for African skin.',
    priceNaira: 18500,
    compareAtPriceNaira: 24000,
    mediaUrls: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop'],
    category: 'Beauty',
    stockCount: 150,
    isAvailable: true,
    sampleAvailable: true,
    deliveryInfo: 'Fast dispatch to Lagos & Abuja (2-3 business days)',
    commissionPercent: 15,
    createdAt: new Date().toISOString()
  });

  assert(newProduct && newProduct.id.startsWith('prod-test-'), 'Business product created with ID and sample availability');
  assert(newProduct.commissionPercent === 15, 'Affiliate commission rate set to 15%');
  assert(newProduct.sampleAvailable === true, 'Free sample request is available for creators');

  // ────────────────────────────────────────────────────────────────
  // PERSONA 1: CREATOR APPLIES FOR FREE SAMPLE TO PROMOTE
  // ────────────────────────────────────────────────────────────────
  console.log('\n🎨 [PERSONA: CREATOR] Browsing TikTok Shop & Applying for Sample');
  const testCreatorId = 'creator-amara-test';
  const testCampaignId = 'camp-beauty-1';

  const application = await createCreatorApplication({
    id: `app-test-${Date.now()}`,
    campaignId: testCampaignId,
    creatorId: testCreatorId,
    creatorName: 'Amara Okafor',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    creatorCategory: 'Beauty & Skincare',
    creatorFollowers: 24500,
    productTitle: newProduct.title,
    pitch: 'I create authentic unboxing & before/after skincare reels with 15k+ organic views on TikTok & Instagram.',
    sampleRequested: true,
    shippingAddress: 'Plot 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    status: 'pending',
    sampleStatus: 'requested',
    createdAt: new Date().toISOString()
  });

  assert(application && application.status === 'pending', 'Creator submitted sample request application in pending state');
  assert(application.sampleStatus === 'requested', 'Sample status marked as requested');
  assert(application.shippingAddress.includes('Lagos'), 'Shipping destination saved correctly');

  // ────────────────────────────────────────────────────────────────
  // PERSONA 2: BUSINESS REVIEWS & APPROVES SAMPLE + CREATES AFFILIATE LINK
  // ────────────────────────────────────────────────────────────────
  console.log('\n🏢 [PERSONA: BUSINESS] Reviewing Applications in Business Studio');
  const businessApps = await getCreatorApplications(undefined, testCreatorId);
  const targetApp = businessApps.find(a => a.id === application.id);
  assert(targetApp !== undefined, 'Business found creator application in Creator Requests & Samples tab');

  console.log('🏢 [PERSONA: BUSINESS] Approving Creator & Dispatching Sample');
  const approvalResult = await updateApplicationStatus(
    application.id,
    'approved',
    'Sample dispatched via DHL Express. Welcome to the brand partner program!'
  );

  assert(approvalResult && approvalResult.status === 'approved', 'Application approved by brand');
  assert(approvalResult.sampleStatus === 'shipped', 'Sample package marked as shipped');
  assert(approvalResult.trackingCode && approvalResult.trackingCode.startsWith('DHL-NG-'), `Tracking number generated: ${approvalResult.trackingCode}`);

  // Check that unique affiliate link was generated for this creator
  const db = await getDb();
  const affiliateLink = (db.affiliateLinks || []).find(l => l.creatorId === testCreatorId);
  assert(affiliateLink !== undefined, `Affiliate link generated: /r/${affiliateLink?.code}`);
  assert(affiliateLink?.commissionPercent === 15, 'Affiliate link matches product 15% commission');

  // ────────────────────────────────────────────────────────────────
  // PERSONA 3: CONSUMER WATCHES VIDEO, CLICKS AFFILIATE LINK & BUYS
  // ────────────────────────────────────────────────────────────────
  console.log('\n🛒 [PERSONA: CONSUMER] Shoppable Reel Discovery & Checkout');
  const initialWallet = await getWallet(testCreatorId);
  const initialPending = initialWallet.pendingBalanceNaira;

  const orderValue = 18500;
  const expectedCommission = Math.round((orderValue * 15) / 100); // 2,775 NGN

  const customerOrder = await createCommerceOrder({
    id: `ord-test-${Date.now()}`,
    productId: newProduct.id,
    productTitle: newProduct.title,
    businessId: testBusinessId,
    businessName: 'GlowSkin Organics',
    customerName: 'Chidinma Adeyemi',
    customerPhone: '+2348031234567',
    customerAddress: 'Victoria Island, Lagos',
    creatorId: testCreatorId,
    creatorName: 'Amara Okafor',
    affiliateCode: affiliateLink?.code || 'AMARA-SHEA',
    unitPriceNaira: orderValue,
    quantity: 1,
    totalAmountNaira: orderValue,
    commissionEarnedNaira: expectedCommission,
    status: 'fulfilled',
    createdAt: new Date().toISOString()
  });

  assert(customerOrder && customerOrder.id.startsWith('ord-test-'), 'Consumer order processed and fulfilled');
  assert(customerOrder.commissionEarnedNaira === 2775, `Commission calculated correctly: ₦${expectedCommission}`);

  // ────────────────────────────────────────────────────────────────
  // PERSONA 1: CREATOR WALLET AUTOMATIC ATTRIBUTION & WITHDRAWAL TEST
  // ────────────────────────────────────────────────────────────────
  console.log('\n💰 [PERSONA: CREATOR] Verifying Wallet Commission & Ledger');
  const updatedWallet = await getWallet(testCreatorId);
  assert(
    updatedWallet.pendingBalanceNaira === initialPending + expectedCommission,
    `Creator wallet pending balance credited with ₦${expectedCommission} (Total: ₦${updatedWallet.pendingBalanceNaira})`
  );
  assert(
    updatedWallet.totalEarnedAffiliateNaira >= expectedCommission,
    `Total affiliate earnings counter updated: ₦${updatedWallet.totalEarnedAffiliateNaira}`
  );

  const transactions = await getWalletTransactions(testCreatorId);
  const purchaseTx = transactions.find(t => t.description.includes('Affiliate sale'));
  assert(purchaseTx !== undefined, `Wallet transaction ledger recorded: "${purchaseTx?.description}" (+₦${purchaseTx?.amountNaira})`);

  // ────────────────────────────────────────────────────────────────
  // PERSONA 3: CONSUMER SOCIAL ENGAGEMENT & REVIEW SUBMISSION
  // ────────────────────────────────────────────────────────────────
  console.log('\n⭐ [PERSONA: CONSUMER] Leaving Review & Social Validation');
  const review = await createReview({
    id: `rev-test-${Date.now()}`,
    creatorId: testCreatorId,
    bookingId: 'book-sample-1',
    projectTitle: 'Whipped Shea Butter UGC Video',
    reviewerName: 'Chidinma Adeyemi',
    reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    reviewerRole: 'Brand Partner & Verified Buyer',
    overallRating: 5,
    ratingQuality: 5,
    ratingCommunication: 5,
    ratingTimeliness: 5,
    reviewText: 'Saw this on Amara\'s reel and ordered immediately. The body butter feels amazing and genuine delivery!',
    isVerifiedBooking: true,
    createdAt: new Date().toISOString()
  });

  assert(review && review.overallRating === 5, 'Consumer left 5-star review');
  const creatorReviews = await getReviewsByCreatorId(testCreatorId);
  assert(creatorReviews.some(r => r.id === review.id), 'Review verified on creator portfolio profile');

  // ────────────────────────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────────────────────────
  console.log('\n====================================================');
  console.log(`🏁 TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPersonaTestSuite().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
