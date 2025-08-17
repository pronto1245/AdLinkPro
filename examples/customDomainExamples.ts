/**
 * Custom Domain Management - Usage Examples
 * 
 * This file demonstrates how to use the enhanced custom domain system
 * with real-world examples and best practices.
 */

import { CustomDomainService } from '../server/services/customDomains';
import { enhancedDNS } from '../server/services/enhancedDNS';
import { SSLProviderService } from '../server/services/sslProvider';

// Example 1: Complete Domain Setup Workflow
async function setupCustomDomain() {
  const advertiserId = 'advertiser-123';
  const domainName = 'track.mycompany.com';

  try {
    console.log('🚀 Starting custom domain setup for', domainName);

    // Step 1: Create the domain
    const domain = await CustomDomainService.createCustomDomain({
      advertiserId,
      domain: domainName,
      type: 'cname'
    });

    console.log('✅ Domain created:', domain.id);

    // Step 2: Show DNS instructions to user
    const instructions = CustomDomainService.getDNSInstructions(domain);
    console.log('📋 DNS Setup Instructions:');
    console.log(`Type: ${instructions.type}`);
    console.log(`Record: ${instructions.record}`);
    console.log(`Value: ${instructions.value}`);
    console.log('Instructions:', instructions.instructions);

    // Step 3: Wait for user to configure DNS (in real app, this would be user-driven)
    console.log('⏳ Waiting for DNS configuration...');
    
    // Step 4: Verify domain
    let verificationAttempts = 0;
    let verified = false;

    while (verificationAttempts < 3 && !verified) {
      const result = await CustomDomainService.verifyDomain(domain.id);
      
      if (result.success) {
        console.log('✅ Domain verification successful!');
        verified = true;

        // Step 5: Request SSL certificate
        console.log('🔒 Requesting SSL certificate...');
        await CustomDomainService.requestSSLCertificate(domainName, domain.id);
        
        // Step 6: Update tracking links
        console.log('🔄 Updating tracking links...');
        await CustomDomainService.updateTrackingLinksWithDomain(advertiserId, domainName);
        
        console.log('🎉 Custom domain setup complete!');
        
      } else {
        console.log(`❌ Verification failed (attempt ${verificationAttempts + 1}/3):`, result.error);
        
        // Show helpful error message based on error type
        if (result.errorDetails) {
          switch (result.errorDetails.type) {
            case 'RECORD_NOT_FOUND':
              console.log('💡 Make sure you\'ve added the DNS record and it has propagated');
              break;
            case 'TIMEOUT':
              console.log('💡 DNS servers may be slow, try again in a few minutes');
              break;
            case 'DNS_SERVER_UNAVAILABLE':
              console.log('💡 DNS server is temporarily unavailable');
              break;
          }
        }
        
        verificationAttempts++;
        if (verificationAttempts < 3) {
          console.log('🔄 Retrying in 30 seconds...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      }
    }

    if (!verified) {
      console.log('❌ Domain verification failed after 3 attempts');
      return false;
    }

    return true;

  } catch (error) {
    console.error('💥 Domain setup failed:', error.message);
    return false;
  }
}

// Example 2: Bulk Domain Management
async function manageBulkDomains() {
  const advertiserId = 'advertiser-456';
  const domains = [
    'track1.example.com',
    'track2.example.com', 
    'links.example.com'
  ];

  console.log('📦 Setting up multiple domains for advertiser', advertiserId);

  // Check current domain count and limits
  const stats = await CustomDomainService.getDomainStats(advertiserId);
  const availableSlots = stats.remainingSlots;

  if (domains.length > availableSlots) {
    console.log(`❌ Cannot add ${domains.length} domains. Only ${availableSlots} slots available.`);
    return;
  }

  // Create all domains
  const createdDomains = [];
  for (const domainName of domains) {
    try {
      const domain = await CustomDomainService.createCustomDomain({
        advertiserId,
        domain: domainName,
        type: 'cname'
      });
      createdDomains.push(domain);
      console.log(`✅ Created domain: ${domainName}`);
    } catch (error) {
      console.log(`❌ Failed to create ${domainName}:`, error.message);
    }
  }

  // Show setup instructions for all domains
  console.log('\n📋 DNS Setup Instructions for all domains:');
  createdDomains.forEach(domain => {
    const instructions = CustomDomainService.getDNSInstructions(domain);
    console.log(`\n${domain.domain}:`);
    console.log(`  Type: ${instructions.type}`);
    console.log(`  Value: ${instructions.value}`);
  });

  console.log(`\n🎯 Created ${createdDomains.length} domains. Set up DNS records and verify each domain.`);
}

// Example 3: DNS Validation and Caching
async function demonstrateDNSFeatures() {
  console.log('🔍 DNS Features Demonstration');

  const testDomain = 'example.com';

  // Test DNS resolution with caching
  console.log('\n1. DNS Resolution with Caching:');
  
  // First query (will be cached)
  const result1 = await enhancedDNS.resolveCname(testDomain);
  console.log(`First query - From cache: ${result1.fromCache}`);
  
  // Second query (should come from cache)
  const result2 = await enhancedDNS.resolveCname(testDomain);
  console.log(`Second query - From cache: ${result2.fromCache}`);

  // Clear cache and query again
  CustomDomainService.clearDNSCache(testDomain);
  const result3 = await enhancedDNS.resolveCname(testDomain);
  console.log(`After cache clear - From cache: ${result3.fromCache}`);

  // Show cache statistics
  const cacheStats = CustomDomainService.getDNSCacheStats();
  console.log('\n2. DNS Cache Statistics:', cacheStats);

  // Demonstrate error handling
  console.log('\n3. DNS Error Handling:');
  const invalidResult = await enhancedDNS.resolveCname('invalid-domain-name-12345.com');
  if (!invalidResult.success && invalidResult.error) {
    console.log(`Error type: ${invalidResult.error.type}`);
    console.log(`Error message: ${invalidResult.error.message}`);
  }
}

// Example 4: SSL Certificate Management
async function demonstrateSSLFeatures() {
  console.log('🔒 SSL Certificate Management');

  const sslService = new SSLProviderService();
  
  // Get provider configuration info
  const providerInfo = sslService.getProviderInstructions();
  console.log('\n1. Current SSL Provider Configuration:');
  console.log(`Provider: ${providerInfo.provider}`);
  console.log(`Requirements:`, providerInfo.requirements);
  console.log(`Setup Steps:`, providerInfo.setupSteps);

  // Validate existing SSL certificate
  console.log('\n2. SSL Certificate Validation:');
  const sslValidation = await sslService.validateCertificate('github.com');
  if (sslValidation.valid) {
    console.log(`✅ SSL valid until: ${sslValidation.validUntil}`);
    console.log(`Issuer: ${sslValidation.issuer}`);
  } else {
    console.log(`❌ SSL validation failed: ${sslValidation.error}`);
  }
}

// Example 5: Error Recovery and Retry Logic
async function demonstrateErrorRecovery() {
  console.log('🛠️ Error Recovery Demonstration');

  const advertiserId = 'advertiser-789';
  const problematicDomain = 'nonexistent-domain-12345.com';

  try {
    // This will likely fail due to invalid domain
    const domain = await CustomDomainService.createCustomDomain({
      advertiserId,
      domain: problematicDomain,
      type: 'cname'
    });

    // Attempt verification with retry logic
    let retries = 3;
    while (retries > 0) {
      const result = await CustomDomainService.verifyDomain(domain.id);
      
      if (result.success) {
        console.log('✅ Verification successful after retries');
        break;
      } else {
        console.log(`❌ Attempt failed (${4 - retries}/3):`, result.error);
        
        // Clear DNS cache before retry
        CustomDomainService.clearDNSCache(problematicDomain);
        
        retries--;
        if (retries > 0) {
          console.log('🔄 Waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    if (retries === 0) {
      console.log('❌ All retry attempts failed');
    }

  } catch (error) {
    console.log('💥 Domain creation failed:', error.message);
    
    // Show recovery suggestions
    if (error.message.includes('Domain limit exceeded')) {
      console.log('💡 Suggestion: Remove unused domains or increase limit');
      
      // Show current domain stats
      const stats = await CustomDomainService.getDomainStats(advertiserId);
      console.log('Current stats:', stats);
    }
  }
}

// Example 6: Performance Monitoring
async function monitorPerformance() {
  console.log('📊 Performance Monitoring');

  const advertiserId = 'advertiser-performance-test';
  
  // Test batch operations performance
  console.log('\n1. Batch Operations Performance Test:');
  
  const startTime = Date.now();
  
  // Simulate updating many tracking links
  await CustomDomainService.updateTrackingLinksWithDomain(
    advertiserId, 
    'fast-domain.com'
  );
  
  const endTime = Date.now();
  console.log(`Batch update completed in ${endTime - startTime}ms`);

  // Monitor DNS cache performance
  console.log('\n2. DNS Cache Performance:');
  const cacheStats = CustomDomainService.getDNSCacheStats();
  console.log('Cache stats:', cacheStats);

  // Test multiple DNS queries
  const domains = ['example.com', 'google.com', 'github.com'];
  const dnsStartTime = Date.now();
  
  await Promise.all(domains.map(domain => enhancedDNS.resolveA(domain)));
  
  const dnsEndTime = Date.now();
  console.log(`Parallel DNS queries completed in ${dnsEndTime - dnsStartTime}ms`);
}

// Main execution function
async function runExamples() {
  console.log('🎯 Custom Domain Management Examples\n');

  try {
    // Run all examples
    console.log('='.repeat(50));
    await setupCustomDomain();
    
    console.log('\n' + '='.repeat(50));
    await manageBulkDomains();
    
    console.log('\n' + '='.repeat(50));
    await demonstrateDNSFeatures();
    
    console.log('\n' + '='.repeat(50));
    await demonstrateSSLFeatures();
    
    console.log('\n' + '='.repeat(50));
    await demonstrateErrorRecovery();
    
    console.log('\n' + '='.repeat(50));
    await monitorPerformance();
    
    console.log('\n🎉 All examples completed!');
    
  } catch (error) {
    console.error('💥 Example execution failed:', error);
  }
}

// Export examples for individual use
export {
  setupCustomDomain,
  manageBulkDomains,
  demonstrateDNSFeatures,
  demonstrateSSLFeatures,
  demonstrateErrorRecovery,
  monitorPerformance,
  runExamples
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}