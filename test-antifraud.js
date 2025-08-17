// Test antifraud integration in postback system
const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';

// Test data for antifraud scenarios
const testCases = [
  {
    name: 'Hard Antifraud - Should Block All Profiles',
    data: {
      conversionId: 'conv_hard_af_001',
      advertiserId: '1',
      partnerId: 'test',
      clickid: 'hard_block_test_123',
      type: 'purchase',
      txid: 'tx_hard_001',
      status: 'approved',
      revenue: '199.99',
      currency: 'USD',
      antifraudLevel: 'hard'
    },
    expected: 'All profiles blocked'
  },
  {
    name: 'Soft Antifraud - Backup Should Block Approved',
    data: {
      conversionId: 'conv_soft_af_001',
      advertiserId: '1',
      partnerId: 'test',
      clickid: 'soft_block_test_123',
      type: 'purchase',
      txid: 'tx_soft_001',
      status: 'approved',
      revenue: '149.99',
      currency: 'EUR',
      antifraudLevel: 'soft'
    },
    expected: 'Backup profile blocks approved status'
  },
  {
    name: 'Clean Conversion - Should Pass All',
    data: {
      conversionId: 'conv_clean_001',
      advertiserId: '1',
      partnerId: 'test',
      clickid: 'clean_test_123',
      type: 'purchase',
      txid: 'tx_clean_001',
      status: 'approved',
      revenue: '99.99',
      currency: 'USD',
      antifraudLevel: 'ok'
    },
    expected: 'All profiles process successfully'
  },
  {
    name: 'Soft Pending - Should Pass All Including Backup',
    data: {
      conversionId: 'conv_soft_pending_001',
      advertiserId: '1',
      partnerId: 'test',
      clickid: 'soft_pending_test_123',
      type: 'purchase',
      txid: 'tx_soft_pending_001',
      status: 'pending',
      revenue: '75.50',
      currency: 'USD',
      antifraudLevel: 'soft'
    },
    expected: 'All profiles process pending status'
  }
];

async function runAntifraudTest() {
  console.log('🧪 Testing Antifraud Integration in Postback System\n');
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Expected: ${testCase.expected}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/v3/postback/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });
      
      const result = await response.json();
      console.log(`Result: ${JSON.stringify(result, null, 2)}`);
      console.log('---\n');
      
    } catch (error) {
      console.error(`Error: ${error.message}\n`);
    }
  }
  
  // Get final statistics
  try {
    const statsResponse = await fetch(`${baseUrl}/api/queue/stats`);
    const stats = await statsResponse.json();
    
    console.log('📊 Final Antifraud Statistics:');
    console.log(`Total Blocks: ${stats.processor.antifraud.totalBlocks}`);
    console.log(`Hard Blocks: ${stats.processor.antifraud.hardBlocks}`);
    console.log(`Soft Blocks: ${stats.processor.antifraud.softBlocks}`);
    console.log(`Block Rate: ${stats.processor.antifraud.blockRate.toFixed(2)}%`);
    console.log(`Overall Success Rate: ${stats.processor.successRate.toFixed(2)}%`);
    
  } catch (error) {
    console.error(`Stats Error: ${error.message}`);
  }
}

// Run the test
runAntifraudTest();