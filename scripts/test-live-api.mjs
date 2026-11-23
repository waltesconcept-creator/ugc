// Automated End-to-End Persona Verification via HTTP API
// Tests all 3 personas: Creator, Business, and Consumer (User)

const BASE_URL = process.env.TEST_URL || 'https://ugc-b3pl.onrender.com';

async function runTestSuite() {
  console.log('====================================================');
  console.log(`🌐 RUNNING RIGOROUS 3-PERSONA LIVE TESTS AGAINST: ${BASE_URL}`);
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

  // 1. Health & Initial Catalog Check
  console.log('📡 [HEALTH CHECK] Verifying server status...');
  const healthRes = await fetch(`${BASE_URL}/api/products`);
  assert(healthRes.ok, `Server returned HTTP ${healthRes.status} OK`);
  const initialProductsData = await healthRes.json();
  assert(initialProductsData.success === true, 'Products API endpoint returned success');
  console.log(`  ℹ️ Found ${initialProductsData.products?.length || 0} initial products in catalog\n`);

  // ────────────────────────────────────────────────────────────────
  // PERSONA 2: THE BUSINESS (List product & set 20% commission + samples)
  // ────────────────────────────────────────────────────────────────
  console.log('🏢 [PERSONA: BUSINESS] Listing New Product with Sample Program & Commission');
  const testBusinessId = `biz-test-${Date.now()}`;
  const createProductRes = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessId: testBusinessId,
      businessName: 'Ziva Luxury Botanicals',
      title: 'Hibiscus & Moringa Rejuvenating Glow Elixir',
      description: 'Handcrafted antioxidant serum made with certified organic Nigerian botanicals.',
      priceNaira: 22000,
      compareAtPriceNaira: 28000,
      category: 'Beauty',
      stockCount: 120,
      sampleAvailable: true,
      commissionPercent: 20,
      deliveryInfo: 'Express nationwide dispatch within 48 hours',
    }),
  });

  assert(createProductRes.ok, `Product creation HTTP ${createProductRes.status}`);
  const productData = await createProductRes.json();
  assert(productData.success === true, 'Product created successfully in database');
  const createdProduct = productData.product;
  assert(createdProduct && createdProduct.id, `Product created with ID: ${createdProduct?.id}`);
  assert(createdProduct?.commissionPercent === 20, 'Commission set to 20%');
  assert(createdProduct?.sampleAvailable === true, 'Free sample program enabled for creators\n');

  // ────────────────────────────────────────────────────────────────
  // PERSONA 1: THE CREATOR (Browse Affiliate Market & Apply for Sample)
  // ────────────────────────────────────────────────────────────────
  console.log('🎨 [PERSONA: CREATOR] Applying for Free Sample in TikTok Shop Market');
  const testCreatorId = `creator-test-${Date.now()}`;
  const applyRes = await fetch(`${BASE_URL}/api/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'apply',
      campaignId: 'camp-beauty-1',
      creatorId: testCreatorId,
      creatorName: 'Adaora Eze',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      creatorCategory: 'Beauty & Skincare',
      creatorFollowers: 32000,
      productTitle: createdProduct.title,
      pitch: 'I have 32k engaged TikTok followers looking for luxury organic skincare. I will produce 2 high-conversion UGC videos.',
      sampleRequested: true,
      shippingAddress: '15 Admiralty Way, Lekki Phase 1, Lagos State',
    }),
  });

  assert(applyRes.ok, `Creator application submission HTTP ${applyRes.status}`);
  const applyData = await applyRes.json();
  assert(applyData.success === true, 'Creator application registered');
  const application = applyData.application;
  assert(application && application.status === 'pending', 'Application registered in pending status');
  assert(application?.sampleStatus === 'requested', 'Sample dispatch marked as requested\n');

  // ────────────────────────────────────────────────────────────────
  // PERSONA 2: THE BUSINESS (Reviews & Approves Application in Studio)
  // ────────────────────────────────────────────────────────────────
  console.log('🏢 [PERSONA: BUSINESS] Reviewing Applications in Business Studio');
  const getAppsRes = await fetch(`${BASE_URL}/api/campaigns?creatorId=${testCreatorId}`);
  const getAppsData = await getAppsRes.json();
  assert(getAppsData.success === true, 'Business successfully retrieved pending applications');
  const pendingApp = (getAppsData.applications || []).find((a) => a.id === application.id);
  assert(pendingApp !== undefined, `Found creator application for ${pendingApp?.creatorName}`);

  console.log('🏢 [PERSONA: BUSINESS] Approving Creator & Dispatching Free Sample');
  const approveRes = await fetch(`${BASE_URL}/api/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'approve_application',
      applicationId: application.id,
      notes: 'Approved! Sample dispatched via DHL. Unique affiliate tracking link generated.',
    }),
  });

  assert(approveRes.ok, `Application approval HTTP ${approveRes.status}`);
  const approveData = await approveRes.json();
  assert(approveData.success === true, 'Application approved successfully');
  assert(approveData.application?.status === 'approved', 'Status transitioned to approved');
  assert(approveData.application?.sampleStatus === 'shipped', 'Sample status updated to shipped');
  assert(
    approveData.application?.trackingCode && approveData.application.trackingCode.startsWith('DHL-NG-'),
    `Sample tracking number assigned: ${approveData.application?.trackingCode}`
  );
  assert(approveData.affiliateLink && approveData.affiliateLink.code, `Affiliate link generated: /r/${approveData.affiliateLink?.code}\n`);

  // ────────────────────────────────────────────────────────────────
  // PERSONA 3: THE CONSUMER (User watches reel, clicks link & completes checkout)
  // ────────────────────────────────────────────────────────────────
  console.log('🛒 [PERSONA: CONSUMER] Express Checkout via Affiliate Link');
  const affiliateCode = approveData.affiliateLink?.code || 'ZIVA-GLOW';
  const orderPriceNaira = 22000;
  const commissionEarnedNaira = Math.round((orderPriceNaira * 20) / 100); // 4,400 NGN

  const orderRes = await fetch(`${BASE_URL}/api/wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'simulate_purchase',
      productId: createdProduct.id,
      productTitle: createdProduct.title,
      businessId: testBusinessId,
      businessName: 'Ziva Luxury Botanicals',
      customerName: 'Kemi Balogun',
      creatorId: testCreatorId,
      creatorName: 'Adaora Eze',
      affiliateCode: affiliateCode,
      unitPriceNaira: orderPriceNaira,
      commissionEarnedNaira: commissionEarnedNaira,
    }),
  });

  assert(orderRes.ok, `Consumer checkout HTTP ${orderRes.status}`);
  const orderData = await orderRes.json();
  assert(orderData.success === true, 'Consumer order fulfilled');
  assert(orderData.order && orderData.order.id, `Order ID created: ${orderData.order?.id}`);
  assert(orderData.order?.commissionEarnedNaira === commissionEarnedNaira, `Affiliate commission calculated: ₦${commissionEarnedNaira.toLocaleString()}\n`);

  // ────────────────────────────────────────────────────────────────
  // PERSONA 1: THE CREATOR (Verify Wallet Earnings & Bank Withdrawal)
  // ────────────────────────────────────────────────────────────────
  console.log('💰 [PERSONA: CREATOR] Checking Creator Wallet & Requesting Withdrawal');
  const walletRes = await fetch(`${BASE_URL}/api/wallet?userId=${testCreatorId}`);
  assert(walletRes.ok, `Wallet fetch HTTP ${walletRes.status}`);
  const walletData = await walletRes.json();
  assert(walletData.success === true, 'Wallet retrieved successfully');
  assert(
    walletData.wallet?.pendingBalanceNaira === commissionEarnedNaira,
    `Creator wallet credited with ₦${commissionEarnedNaira.toLocaleString()} pending balance`
  );
  assert(
    walletData.wallet?.totalEarnedAffiliateNaira >= commissionEarnedNaira,
    `Total affiliate earnings ledger updated: ₦${walletData.wallet?.totalEarnedAffiliateNaira?.toLocaleString()}`
  );
  assert(
    walletData.transactions?.length > 0,
    `Transaction ledger contains ${walletData.transactions?.length} entry: "${walletData.transactions?.[0]?.description}"\n`
  );

  // ────────────────────────────────────────────────────────────────
  // PERSONA 3: THE CONSUMER (Leaves 5-Star Verified Review on Creator Profile)
  // ────────────────────────────────────────────────────────────────
  console.log('⭐ [PERSONA: CONSUMER] Submitting 5-Star Review on Creator Portfolio');
  const reviewRes = await fetch(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creatorId: testCreatorId,
      bookingId: 'sample-collab-1',
      projectTitle: 'Hibiscus Glow Serum Video',
      reviewerName: 'Kemi Balogun',
      reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      reviewerRole: 'Verified Customer & Brand Partner',
      overallRating: 5,
      ratingQuality: 5,
      ratingCommunication: 5,
      ratingTimeliness: 5,
      reviewText: 'Adaora delivered incredible content! Product sales went through the roof within 24 hours of her reel posting.',
      isVerifiedBooking: true,
    }),
  });

  assert(reviewRes.ok, `Review submission HTTP ${reviewRes.status}`);
  const reviewData = await reviewRes.json();
  assert(reviewData.success === true, 'Review posted and verified on creator profile\n');

  // ────────────────────────────────────────────────────────────────
  // FINAL REPORT
  // ────────────────────────────────────────────────────────────────
  console.log('====================================================');
  console.log(`🏁 3-PERSONA RIGOROUS TEST SUMMARY:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
