import request from 'supertest';
import { createTestApp } from './testApp';

const app = createTestApp();

describe('Profile and Settings Integration Demo', () => {

  it('should demonstrate complete profile management workflow', async () => {
    // Step 1: Login as partner
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-partner@example.com',
        password: 'partner123'
      });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.token;

    // Step 2: Get initial profile
    const initialProfile = await request(app)
      .get('/api/partner/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(initialProfile.status).toBe(200);
    console.log('✅ Initial profile loaded:', {
      name: `${initialProfile.body.firstName} ${initialProfile.body.lastName}`,
      email: initialProfile.body.email,
      timezone: initialProfile.body.timezone
    });

    // Step 3: Update profile with comprehensive data
    const profileUpdate = {
      firstName: 'John',
      lastName: 'Smith',
      company: 'Demo Marketing Ltd',
      country: 'US',
      timezone: 'America/New_York',
      currency: 'USD',
      telegram: 'john_demo',
      phone: '+1-555-123-4567'
    };

    const updateResponse = await request(app)
      .patch('/api/partner/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileUpdate);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.firstName).toBe('John');
    expect(updateResponse.body.telegram).toBe('@john_demo');
    console.log('✅ Profile updated successfully with business information');

    // Step 4: Test settings-like updates
    const settingsUpdate = {
      timezone: 'Europe/London',
      currency: 'GBP',
      language: 'en'
    };

    const settingsResponse = await request(app)
      .patch('/api/partner/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(settingsUpdate);

    expect(settingsResponse.status).toBe(200);
    expect(settingsResponse.body.timezone).toBe('Europe/London');
    console.log('✅ Settings updated (timezone/currency/language)');

    // Step 5: Test password change
    const passwordChange = {
      currentPassword: 'partner123',
      newPassword: 'newSecurePass123!'
    };

    const passwordResponse = await request(app)
      .post('/api/partner/profile/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send(passwordChange);

    expect(passwordResponse.status).toBe(200);
    console.log('✅ Password changed successfully');

    // Step 6: Verify login with new password
    const newLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-partner@example.com',
        password: 'newSecurePass123!'
      });

    expect(newLoginResponse.status).toBe(200);
    console.log('✅ Login successful with new password');

    // Step 7: Final profile verification
    const finalProfile = await request(app)
      .get('/api/partner/profile')
      .set('Authorization', `Bearer ${newLoginResponse.body.token}`);

    expect(finalProfile.status).toBe(200);
    expect(finalProfile.body.firstName).toBe('John');
    expect(finalProfile.body.timezone).toBe('Europe/London');
    console.log('✅ Final profile state verified:', {
      name: `${finalProfile.body.firstName} ${finalProfile.body.lastName}`,
      company: finalProfile.body.company,
      location: `${finalProfile.body.country} (${finalProfile.body.timezone})`,
      telegram: finalProfile.body.telegram
    });

    // Reset password for other tests
    await request(app)
      .post('/api/partner/profile/change-password')
      .set('Authorization', `Bearer ${newLoginResponse.body.token}`)
      .send({
        currentPassword: 'newSecurePass123!',
        newPassword: 'partner123'
      });

    console.log('✅ Demo completed successfully - all features working!');
  });

  it('should demonstrate error handling and validation', async () => {
    const token = (await request(app)
      .post('/api/auth/login')
      .send({ email: 'test-partner@example.com', password: 'partner123' })).body.token;

    // Test invalid data handling
    const invalidUpdates = [
      { firstName: '   ', expectedStatus: 400, description: 'whitespace-only name' },
      { telegram: 'invalid-username!', expectedStatus: 400, description: 'invalid telegram format' },
    ];

    for (const test of invalidUpdates) {
      const response = await request(app)
        .patch('/api/partner/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ [Object.keys(test)[0]]: Object.values(test)[0] });
      
      expect(response.status).toBe(test.expectedStatus);
      console.log(`✅ Validation working for ${test.description}`);
    }

    // Test password validation
    const passwordTests = [
      { currentPassword: 'wrong', newPassword: 'valid123', expectedStatus: 400, description: 'wrong current password' },
      { currentPassword: 'partner123', newPassword: '123', expectedStatus: 400, description: 'too short password' }
    ];

    for (const test of passwordTests) {
      const response = await request(app)
        .post('/api/partner/profile/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(test);
      
      expect(response.status).toBe(test.expectedStatus);
      console.log(`✅ Password validation working for ${test.description}`);
    }

    console.log('✅ All validation and error handling tests passed!');
  });

});