import { Router } from 'express';
import { mlFraudDetection } from '../services/mlFraudDetection';
import { db } from '../db';
import { fraudModels, fraudPredictions } from '@shared/antifraud-schema';
import { trackingClicks } from '@shared/schema';
import { eq, desc, gte, count, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Validation schemas
const predictSchema = z.object({
  clickData: z.object({
    clickId: z.string().optional(),
    ipAddress: z.string(),
    country: z.string(),
    userAgent: z.string(),
    referer: z.string().optional(),
    device: z.string().optional(),
    browser: z.string().optional(),
    createdAt: z.string().optional()
  }),
  modelId: z.string().optional()
});

const trainModelSchema = z.object({
  modelName: z.string(),
  trainingData: z.array(z.object({
    clickData: z.record(z.any()),
    isFraud: z.boolean()
  }))
});

const updateThresholdsSchema = z.object({
  adjustments: z.record(z.number())
});

// Predict fraud for a single click
router.post('/predict', async (req, res) => {
  try {
    const validation = predictSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { clickData, modelId } = validation.data;
    
    // Add current timestamp if not provided
    const enrichedClickData = {
      ...clickData,
      createdAt: clickData.createdAt ? new Date(clickData.createdAt) : new Date()
    };

    const prediction = await mlFraudDetection.predict(enrichedClickData, modelId);

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Error making fraud prediction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch predict fraud for multiple clicks
router.post('/predict/batch', async (req, res) => {
  try {
    const { clicks, modelId } = req.body;
    
    if (!Array.isArray(clicks)) {
      return res.status(400).json({
        error: 'clicks must be an array'
      });
    }

    const predictions = [];
    
    for (const clickData of clicks) {
      try {
        const prediction = await mlFraudDetection.predict(clickData, modelId);
        predictions.push({
          clickId: clickData.clickId,
          prediction
        });
      } catch (error) {
        predictions.push({
          clickId: clickData.clickId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    res.json({
      success: true,
      data: {
        total: clicks.length,
        successful: predictions.filter(p => !p.error).length,
        failed: predictions.filter(p => p.error).length,
        predictions
      }
    });
  } catch (error) {
    console.error('Error making batch predictions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all available models
router.get('/models', async (req, res) => {
  try {
    const models = await db.select()
      .from(fraudModels)
      .orderBy(desc(fraudModels.createdAt));

    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active model
router.get('/models/active', async (req, res) => {
  try {
    const [activeModel] = await db.select()
      .from(fraudModels)
      .where(eq(fraudModels.isActive, true))
      .limit(1);

    if (!activeModel) {
      return res.json({
        success: true,
        data: null,
        message: 'No active model found'
      });
    }

    res.json({
      success: true,
      data: activeModel
    });
  } catch (error) {
    console.error('Error fetching active model:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get model details
router.get('/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [model] = await db.select()
      .from(fraudModels)
      .where(eq(fraudModels.id, id))
      .limit(1);

    if (!model) {
      return res.status(404).json({
        error: 'Model not found'
      });
    }

    res.json({
      success: true,
      data: model
    });
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Train a new model
router.post('/models/train', async (req, res) => {
  try {
    const validation = trainModelSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { modelName, trainingData } = validation.data;
    
    if (trainingData.length < 100) {
      return res.status(400).json({
        error: 'Insufficient training data. Minimum 100 samples required.'
      });
    }

    const modelId = await mlFraudDetection.trainModel(modelName, trainingData);

    res.json({
      success: true,
      data: {
        modelId,
        message: 'Model trained successfully',
        trainingSize: trainingData.length
      }
    });
  } catch (error) {
    console.error('Error training model:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activate a model
router.post('/models/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await mlFraudDetection.activateModel(id);
    
    if (!success) {
      return res.status(404).json({
        error: 'Model not found or activation failed'
      });
    }

    res.json({
      success: true,
      message: 'Model activated successfully'
    });
  } catch (error) {
    console.error('Error activating model:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get model metrics
router.get('/models/:id/metrics', async (req, res) => {
  try {
    const { id } = req.params;
    
    const metrics = mlFraudDetection.getModelMetrics(id);
    
    if (!metrics) {
      return res.status(404).json({
        error: 'Model not found'
      });
    }

    // Get additional metrics from database
    const [predictionStats] = await db.select({
      totalPredictions: count(),
      fraudPredictions: sql<number>`SUM(CASE WHEN prediction = true THEN 1 ELSE 0 END)`,
      avgScore: sql<number>`AVG(score)`,
      avgConfidence: sql<number>`AVG(confidence)`
    })
    .from(fraudPredictions)
    .where(eq(fraudPredictions.modelId, id));

    res.json({
      success: true,
      data: {
        ...metrics,
        usage: predictionStats
      }
    });
  } catch (error) {
    console.error('Error fetching model metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update model thresholds
router.post('/thresholds/update', async (req, res) => {
  try {
    const validation = updateThresholdsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { adjustments } = validation.data;
    
    await mlFraudDetection.updateThresholds(adjustments);

    res.json({
      success: true,
      message: 'Thresholds updated successfully',
      adjustments
    });
  } catch (error) {
    console.error('Error updating thresholds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get prediction history
router.get('/predictions', async (req, res) => {
  try {
    const { 
      modelId, 
      limit = 50, 
      offset = 0,
      prediction,
      startDate,
      endDate 
    } = req.query;

    let query = db.select()
      .from(fraudPredictions);

    const conditions = [];
    
    if (modelId) {
      conditions.push(eq(fraudPredictions.modelId, modelId as string));
    }
    
    if (prediction !== undefined) {
      conditions.push(eq(fraudPredictions.prediction, prediction === 'true'));
    }
    
    if (startDate) {
      conditions.push(gte(fraudPredictions.createdAt, new Date(startDate as string)));
    }
    
    if (endDate) {
      conditions.push(gte(fraudPredictions.createdAt, new Date(endDate as string)));
    }

    if (conditions.length > 0) {
      query = query.where(sql`${conditions.join(' AND ')}`);
    }

    const predictions = await query
      .orderBy(desc(fraudPredictions.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({
      success: true,
      data: predictions,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: predictions.length
      }
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analyze recent performance
router.get('/performance', async (req, res) => {
  try {
    const { days = 7, modelId } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get prediction statistics
    let baseQuery = db.select({
      date: sql<string>`DATE(created_at)`,
      totalPredictions: count(),
      fraudPredictions: sql<number>`SUM(CASE WHEN prediction = true THEN 1 ELSE 0 END)`,
      avgScore: sql<number>`AVG(score)`,
      avgConfidence: sql<number>`AVG(confidence)`
    })
    .from(fraudPredictions)
    .where(gte(fraudPredictions.createdAt, startDate));

    if (modelId) {
      baseQuery = baseQuery.where(eq(fraudPredictions.modelId, modelId as string));
    }

    const dailyStats = await baseQuery
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    // Calculate overall metrics
    const totalPredictions = dailyStats.reduce((sum, day) => sum + day.totalPredictions, 0);
    const totalFraud = dailyStats.reduce((sum, day) => sum + day.fraudPredictions, 0);
    const fraudRate = totalPredictions > 0 ? (totalFraud / totalPredictions) * 100 : 0;

    // Calculate accuracy if we have feedback data
    const accuracyQuery = await db.select({
      correct: sql<number>`SUM(CASE WHEN prediction = actual_outcome THEN 1 ELSE 0 END)`,
      total: count()
    })
    .from(fraudPredictions)
    .where(sql`actual_outcome IS NOT NULL AND created_at >= ${startDate}`);

    const accuracy = accuracyQuery[0]?.total > 0 
      ? (accuracyQuery[0].correct / accuracyQuery[0].total) * 100 
      : null;

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        totalPredictions,
        fraudRate: Number(fraudRate.toFixed(2)),
        accuracy: accuracy ? Number(accuracy.toFixed(2)) : null,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Error analyzing performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Provide feedback on predictions
router.post('/feedback', async (req, res) => {
  try {
    const { predictionId, actualOutcome, notes } = req.body;
    
    if (!predictionId || typeof actualOutcome !== 'boolean') {
      return res.status(400).json({
        error: 'predictionId and actualOutcome (boolean) are required'
      });
    }

    const [updatedPrediction] = await db.update(fraudPredictions)
      .set({
        actualOutcome,
        notes: notes || null
      })
      .where(eq(fraudPredictions.id, predictionId))
      .returning();

    if (!updatedPrediction) {
      return res.status(404).json({
        error: 'Prediction not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback recorded successfully',
      data: updatedPrediction
    });
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feature explanations
router.get('/features/explain', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        features: [
          {
            name: 'ipReputation',
            description: 'Reputation score of the IP address',
            range: '0.0 - 1.0',
            interpretation: 'Higher values indicate worse reputation'
          },
          {
            name: 'clickRate',
            description: 'Click rate from this IP/source',
            range: '0.0 - 1.0',
            interpretation: 'Extremely high or low rates may indicate fraud'
          },
          {
            name: 'conversionRate',
            description: 'Conversion rate from this source',
            range: '0.0 - 1.0',
            interpretation: 'Abnormally high or low rates are suspicious'
          },
          {
            name: 'geoRisk',
            description: 'Risk level of the geographic location',
            range: '0.0 - 1.0',
            interpretation: 'Based on historical fraud patterns by country'
          },
          {
            name: 'deviceFingerprint',
            description: 'Suspicious device characteristics',
            range: '0.0 - 1.0',
            interpretation: 'Inconsistent or unusual device data'
          },
          {
            name: 'timeOfDay',
            description: 'Risk level based on time of activity',
            range: '0.0 - 1.0',
            interpretation: 'Off-hours activity is more suspicious'
          },
          {
            name: 'dayOfWeek',
            description: 'Risk level based on day of week',
            range: '0.0 - 1.0',
            interpretation: 'Weekend activity patterns differ'
          },
          {
            name: 'userAgentEntropy',
            description: 'Entropy analysis of user agent string',
            range: '0.0 - 1.0',
            interpretation: 'Low entropy indicates repetitive patterns'
          },
          {
            name: 'refererTrust',
            description: 'Trust level of the referer source',
            range: '0.0 - 1.0',
            interpretation: 'Unknown or suspicious referers score higher'
          },
          {
            name: 'clickPattern',
            description: 'Analysis of click timing patterns',
            range: '0.0 - 1.0',
            interpretation: 'Too regular or irregular patterns are suspicious'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error getting feature explanations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;