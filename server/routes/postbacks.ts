import { Router } from 'express';
import { storage } from '../storage';
import { insertPostbackProfileSchema } from '@shared/schema';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get postback profiles for current user
router.get('/profiles', authMiddleware, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const ownerScope = role === 'super_admin' ? 'owner' : role === 'advertiser' ? 'advertiser' : 'partner';
    
    const profiles = await storage.getPostbackProfiles(userId, ownerScope);
    res.json(profiles);
  } catch (error) {
    console.error('Get postback profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create postback profile
router.post('/profiles', authMiddleware, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const ownerScope = role === 'super_admin' ? 'owner' : role === 'advertiser' ? 'advertiser' : 'partner';
    
    const profileData = insertPostbackProfileSchema.parse({
      ...req.body,
      ownerId: userId,
      ownerScope,
    });

    const profile = await storage.createPostbackProfile(profileData);
    res.status(201).json(profile);
  } catch (error) {
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
router.put('/profiles/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = insertPostbackProfileSchema.partial().parse(req.body);
    
    const profile = await storage.updatePostbackProfile(id, updateData);
    res.json(profile);
  } catch (error) {
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
router.delete('/profiles/:id', authMiddleware, async (req, res) => {
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
router.get('/deliveries', authMiddleware, async (req, res) => {
  try {
    const { profileId, status } = req.query;
    
    const deliveries = await storage.getPostbackDeliveries(
      profileId as string,
      status as string
    );
    
    res.json(deliveries);
  } catch (error) {
    console.error('Get postback deliveries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test postback profile (dry run)
router.post('/profiles/:id/test', authMiddleware, async (req, res) => {
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