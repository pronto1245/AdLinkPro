// Status normalization tests
import { normalize, isValidTransition, mapExternalStatus, getAllowedNextStatuses } from './status';

// Test basic normalization
console.log('🧪 Testing Status Normalization System');
console.log('=====================================');

// Test 1: Initial status
console.log('\n1️⃣ Initial status test:');
const initial = normalize(undefined, 'initiated', 'purchase');
console.log(`Result: ${initial} (expected: initiated)`);

// Test 2: Forward progression
console.log('\n2️⃣ Forward progression test:');
const forward = normalize('pending', 'approved', 'purchase');
console.log(`Result: ${forward} (expected: approved)`);

// Test 3: Backward progression (should be blocked)
console.log('\n3️⃣ Backward progression test:');
const backward = normalize('approved', 'pending', 'purchase');
console.log(`Result: ${backward} (expected: approved - no backward moves)`);

// Test 4: Registration refund (should be blocked)
console.log('\n4️⃣ Registration refund test:');
const regRefund = normalize('approved', 'refunded', 'reg');
console.log(`Result: ${regRefund} (expected: approved - reg cannot be refunded)`);

// Test 5: Purchase refund (should work from approved)
console.log('\n5️⃣ Purchase refund test:');
const purchaseRefund = normalize('approved', 'refunded', 'purchase');
console.log(`Result: ${purchaseRefund} (expected: refunded)`);

// Test 6: External status mapping
console.log('\n6️⃣ External status mapping test:');
const keitaroLead = mapExternalStatus('lead', 'keitaro');
const pspSuccess = mapExternalStatus('success', 'psp');
const affiliateHold = mapExternalStatus('hold', 'affiliate');
console.log(`Keitaro lead -> ${keitaroLead} (expected: approved)`);
console.log(`PSP success -> ${pspSuccess} (expected: approved)`);
console.log(`Affiliate hold -> ${affiliateHold} (expected: pending)`);

// Test 7: Valid transitions
console.log('\n7️⃣ Valid transition test:');
const validTransition = isValidTransition('pending', 'approved', 'purchase');
const invalidTransition = isValidTransition('approved', 'pending', 'purchase');
console.log(`pending -> approved: ${validTransition} (expected: true)`);
console.log(`approved -> pending: ${invalidTransition} (expected: false)`);

// Test 8: Allowed next statuses
console.log('\n8️⃣ Allowed next statuses test:');
const allowedFromPending = getAllowedNextStatuses('pending', 'purchase');
const allowedFromApproved = getAllowedNextStatuses('approved', 'purchase');
const allowedFromApprovedReg = getAllowedNextStatuses('approved', 'reg');
console.log(`From pending (purchase): [${allowedFromPending.join(', ')}]`);
console.log(`From approved (purchase): [${allowedFromApproved.join(', ')}]`);
console.log(`From approved (reg): [${allowedFromApprovedReg.join(', ')}]`);

console.log('\n✅ Status normalization tests completed');