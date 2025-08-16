// Тест создания оффера через API
const testOfferCreation = async () => {
  const testData = {
    name: `Автотест Оффер ${Date.now()}`,
    description: { ru: "Тестовое описание", en: "Test description" },
    category: "finance",
    payout: 50.0,
    payoutType: "cpa",
    currency: "USD",
    countries: ["US", "RU"],
    landingPageUrl: "https://example.com/test",
    advertiserId: "534c1a63-0cfd-4d0f-a07e-465f379a7645",
    status: "active",
    antifraudEnabled: true,
    kycRequired: false,
    isPrivate: false
  };

  try {
    const response = await fetch('http://localhost:5000/api/advertiser/offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzRjMWE2My0wY2ZkLTRkMGYtYTA3ZS00NjVmMzc5YTc2NDUiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTUzNzEyNzQsImV4cCI6MTc1NTQ1NzY3NH0.test'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('API Response:', response.status, result);
    
    if (response.ok) {
      console.log('✅ Оффер успешно создан:', result.id);
    } else {
      console.log('❌ Ошибка создания:', result.error);
    }
  } catch (error) {
    console.log('❌ Ошибка сети:', error.message);
  }
};

testOfferCreation();