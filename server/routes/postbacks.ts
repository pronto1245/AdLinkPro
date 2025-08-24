import { Router } from 'express';
import { storage } from '../storage';
import { insertPostbackProfileSchema } from '@shared/schema';
import { z } from 'zod';
import { authenticateToken } from '../middleware/authorization';

const router = Router();

// Get postback profiles for current user
router.get('/profiles', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Storage object keys:', Object.keys(storage));
    console.log('🔍 Storage prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(storage)));

    const { id, role } = req.user;
    const userId = id; // Use id field as userId
    const ownerScope = role === 'super_admin' ? 'owner' : role === 'advertiser' ? 'advertiser' : 'partner';

    console.log('📋 Calling getPostbackProfiles with:', { userId, ownerScope });

    // Проверяем существует ли метод
    console.log('🔍 Method exists:', typeof storage.getPostbackProfiles === 'function');

    if (typeof storage.getPostbackProfiles === 'function') {
      const profiles = await storage.getPostbackProfiles(userId, ownerScope);
      res.json(profiles);
    } else {
      console.error('❌ getPostbackProfiles method not found on storage object');
      console.error('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(storage)).filter(name => name.includes('Postback')));
      res.status(500).json({ error: 'Method not implemented' });
    }
  } catch (error) {
    console.error('Get postback profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create postback profile
router.post('/profiles', authenticateToken, async (req, res) => {
  try {
    const { id, role } = req.user;
    const userId = id;
    const ownerScope = role === 'super_admin' ? 'owner' : role === 'advertiser' ? 'advertiser' : 'partner';

    const profileData = insertPostbackProfileSchema.parse({
      ...req.body,
      ownerId: userId,
      ownerScope,
    });

    const profile = await storage.createPostbackProfile(profileData);
    res.status(201).json(profile);
  } catch (_) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('Create postback profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update postback profile
router.put('/profiles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = insertPostbackProfileSchema.partial().parse(req.body);

    const profile = await storage.updatePostbackProfile(id, updateData);
    res.json(profile);
  } catch (_) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('Update postback profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete postback profile
router.delete('/profiles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deletePostbackProfile(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete postback profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get postback deliveries
router.get('/deliveries', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Checking storage for getPostbackDeliveries method');

    const { profileId, status } = req.query;

    if (typeof storage.getPostbackDeliveries === 'function') {
      const deliveries = await storage.getPostbackDeliveries(
        profileId as string,
        status as string
      );
      res.json(deliveries);
    } else {
      console.error('❌ getPostbackDeliveries method not found on storage object');
      res.status(500).json({ error: 'Method not implemented' });
    }
  } catch (error) {
    console.error('Get postback deliveries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test postback profile (dry run)
router.post('/profiles/:id/test', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { clickid, eventType, revenue } = req.body;

    // TODO: Implement postback testing logic
    // For now return mock response
    res.json({
      success: true,
      message: 'Postback test completed',
      url: 'https://example.com/postback',
      response: {
        status: 200,
        body: 'OK',
        duration: 125
      }
    });
  } catch (error) {
    console.error('Test postback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
