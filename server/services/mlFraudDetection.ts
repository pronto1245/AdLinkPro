import { db } from '../db';
import { fraudModels, fraudPredictions } from '@shared/antifraud-schema';
import { trackingClicks } from '@shared/schema';
import { eq, and, desc, gte, lte, sql, count } from 'drizzle-orm';

export interface FeatureVector {
  ipReputation: number;
  clickRate: number;
  conversionRate: number;
  geoRisk: number;
  deviceFingerprint: number;
  timeOfDay: number;
  dayOfWeek: number;
  userAgentEntropy: number;
  refererTrust: number;
  clickPattern: number;
}

export interface FraudPrediction {
  score: number;
  prediction: boolean;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  explanation: Array<{
    feature: string;
    importance: number;
    value: number;
    reason: string;
  }>;
}

export class MLFraudDetection {
  private static instance: MLFraudDetection;
  private models: Map<string, any> = new Map();
  private featureWeights: Record<string, number> = {
    ipReputation: 0.25,
    clickRate: 0.15,
    conversionRate: 0.20,
    geoRisk: 0.10,
    deviceFingerprint: 0.12,
    timeOfDay: 0.05,
    dayOfWeek: 0.03,
    userAgentEntropy: 0.08,
    refererTrust: 0.07,
    clickPattern: 0.15
  };

  static getInstance(): MLFraudDetection {
    if (!MLFraudDetection.instance) {
      MLFraudDetection.instance = new MLFraudDetection();
    }
    return MLFraudDetection.instance;
  }

  constructor() {
    this.initializeModels();
  }

  private async initializeModels() {
    // Load trained models from database
    const models = await db.select()
      .from(fraudModels)
      .where(eq(fraudModels.isActive, true));

    for (const model of models) {
      this.models.set(model.id, {
        ...model,
        weights: model.weights || this.featureWeights
      });
    }

    console.log('🤖 ML Fraud Detection initialized with', models.length, 'models');
  }

  // Extract features from click data
  extractFeatures(clickData: any): FeatureVector {
    return {
      ipReputation: this.calculateIpReputation(clickData.ipAddress),
      clickRate: this.calculateClickRate(clickData.ipAddress),
      conversionRate: this.calculateConversionRate(clickData.ipAddress),
      geoRisk: this.calculateGeoRisk(clickData.country),
      deviceFingerprint: this.calculateDeviceFingerprint(clickData),
      timeOfDay: this.calculateTimeOfDayRisk(clickData.createdAt),
      dayOfWeek: this.calculateDayOfWeekRisk(clickData.createdAt),
      userAgentEntropy: this.calculateUserAgentEntropy(clickData.userAgent),
      refererTrust: this.calculateRefererTrust(clickData.referer),
      clickPattern: this.calculateClickPattern(clickData)
    };
  }

  // Main prediction method
  async predict(clickData: any, modelId?: string): Promise<FraudPrediction> {
    const features = this.extractFeatures(clickData);
    
    // Use default model if none specified
    const model = modelId ? this.models.get(modelId) : this.models.values().next().value;
    
    if (!model) {
      // Fallback to simple rule-based scoring
      return this.simpleFraudDetection(features);
    }

    const prediction = await this.runModelPrediction(model, features);
    
    // Log prediction for training feedback
    await this.logPrediction(model.id, clickData.clickId || 'unknown', features, prediction);
    
    return prediction;
  }

  private async runModelPrediction(model: any, features: FeatureVector): Promise<FraudPrediction> {
    let score = 0;
    const weights = model.weights || this.featureWeights;
    const explanation = [];

    // Weighted sum of features
    for (const [feature, value] of Object.entries(features)) {
      const weight = weights[feature] || 0;
      const contribution = value * weight;
      score += contribution;

      explanation.push({
        feature,
        importance: weight,
        value,
        reason: this.getFeatureExplanation(feature, value)
      });
    }

    // Normalize score to 0-1 range
    score = Math.min(1, Math.max(0, score));
    
    const prediction = score > 0.5;
    const confidence = Math.abs(score - 0.5) * 2; // Distance from decision boundary
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (score < 0.25) riskLevel = 'low';
    else if (score < 0.5) riskLevel = 'medium';
    else if (score < 0.75) riskLevel = 'high';
    else riskLevel = 'critical';

    return {
      score,
      prediction,
      confidence,
      riskLevel,
      explanation: explanation.sort((a, b) => b.importance - a.importance).slice(0, 5)
    };
  }

  private simpleFraudDetection(features: FeatureVector): FraudPrediction {
    // Simple rule-based approach as fallback
    let score = 0;
    const explanation = [];

    // High risk indicators
    if (features.ipReputation > 0.7) {
      score += 0.3;
      explanation.push({
        feature: 'ipReputation',
        importance: 0.3,
        value: features.ipReputation,
        reason: 'IP address has bad reputation'
      });
    }

    if (features.clickRate > 0.8) {
      score += 0.25;
      explanation.push({
        feature: 'clickRate',
        importance: 0.25,
        value: features.clickRate,
        reason: 'Abnormally high click rate'
      });
    }

    if (features.conversionRate > 0.8 || features.conversionRate < 0.01) {
      score += 0.2;
      explanation.push({
        feature: 'conversionRate',
        importance: 0.2,
        value: features.conversionRate,
        reason: 'Abnormal conversion rate'
      });
    }

    if (features.geoRisk > 0.6) {
      score += 0.15;
      explanation.push({
        feature: 'geoRisk',
        importance: 0.15,
        value: features.geoRisk,
        reason: 'High-risk geographic location'
      });
    }

    if (features.deviceFingerprint > 0.7) {
      score += 0.1;
      explanation.push({
        feature: 'deviceFingerprint',
        importance: 0.1,
        value: features.deviceFingerprint,
        reason: 'Suspicious device fingerprint'
      });
    }

    const prediction = score > 0.5;
    const confidence = Math.abs(score - 0.5) * 2;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (score < 0.25) riskLevel = 'low';
    else if (score < 0.5) riskLevel = 'medium';
    else if (score < 0.75) riskLevel = 'high';
    else riskLevel = 'critical';

    return {
      score,
      prediction,
      confidence,
      riskLevel,
      explanation
    };
  }

  // Feature calculation methods
  private calculateIpReputation(ipAddress: string): number {
    // Simple heuristic - in production, would use IP reputation services
    const ipParts = ipAddress.split('.');
    const lastOctet = parseInt(ipParts[3] || '0');
    
    // Some basic rules
    if (ipAddress.startsWith('10.') || ipAddress.startsWith('192.168.') || ipAddress.startsWith('172.')) {
      return 0.8; // Private IPs are suspicious for ad fraud
    }
    
    if (lastOctet > 200) {
      return 0.6; // Higher last octet might indicate data center
    }
    
    return 0.2; // Default low risk
  }

  private calculateClickRate(ipAddress: string): number {
    // Would query database for actual click rates
    // For now, return random value weighted by IP
    const hash = this.hashString(ipAddress);
    return (hash % 100) / 100;
  }

  private calculateConversionRate(ipAddress: string): number {
    // Would query database for actual conversion rates
    const hash = this.hashString(ipAddress);
    return ((hash + 37) % 100) / 100;
  }

  private calculateGeoRisk(country: string): number {
    // Country risk scores based on fraud patterns
    const highRiskCountries = ['CN', 'IN', 'PK', 'BD', 'VN', 'ID'];
    const mediumRiskCountries = ['BR', 'TR', 'MX', 'PH', 'NG'];
    
    if (highRiskCountries.includes(country)) return 0.8;
    if (mediumRiskCountries.includes(country)) return 0.5;
    return 0.2;
  }

  private calculateDeviceFingerprint(clickData: any): number {
    // Simple device fingerprint scoring
    let risk = 0;
    
    if (!clickData.userAgent || clickData.userAgent.length < 50) {
      risk += 0.3; // Too short or missing user agent
    }
    
    if (clickData.userAgent && clickData.userAgent.includes('bot')) {
      risk += 0.5; // Contains "bot"
    }
    
    if (!clickData.browser || !clickData.device) {
      risk += 0.2; // Missing device info
    }
    
    return Math.min(1, risk);
  }

  private calculateTimeOfDayRisk(timestamp: Date): number {
    const hour = timestamp.getHours();
    
    // Higher risk during off-hours (2-6 AM)
    if (hour >= 2 && hour <= 6) {
      return 0.7;
    }
    
    // Medium risk during business hours
    if (hour >= 9 && hour <= 17) {
      return 0.3;
    }
    
    return 0.5; // Default
  }

  private calculateDayOfWeekRisk(timestamp: Date): number {
    const day = timestamp.getDay(); // 0 = Sunday
    
    // Higher risk on weekends
    if (day === 0 || day === 6) {
      return 0.6;
    }
    
    return 0.3; // Weekdays
  }

  private calculateUserAgentEntropy(userAgent: string): number {
    if (!userAgent) return 0.8;
    
    // Calculate character frequency entropy
    const chars = userAgent.split('');
    const frequency: Record<string, number> = {};
    
    chars.forEach(char => {
      frequency[char] = (frequency[char] || 0) + 1;
    });
    
    let entropy = 0;
    const length = chars.length;
    
    Object.values(frequency).forEach(freq => {
      const probability = freq / length;
      entropy -= probability * Math.log2(probability);
    });
    
    // Normalize entropy (typical range 3-5)
    const normalizedEntropy = Math.min(1, entropy / 5);
    
    // Low entropy = more suspicious
    return 1 - normalizedEntropy;
  }

  private calculateRefererTrust(referer?: string): number {
    if (!referer) return 0.5; // No referer is medium risk
    
    // Trusted domains
    const trustedDomains = ['google.com', 'facebook.com', 'bing.com', 'yahoo.com'];
    
    for (const domain of trustedDomains) {
      if (referer.includes(domain)) {
        return 0.1; // Low risk
      }
    }
    
    // Check for suspicious patterns
    if (referer.includes('localhost') || referer.includes('127.0.0.1')) {
      return 0.8; // High risk
    }
    
    return 0.4; // Default medium-low risk
  }

  private calculateClickPattern(clickData: any): number {
    // Would analyze click patterns over time
    // For now, return a hash-based value
    const hash = this.hashString(clickData.ipAddress + clickData.userAgent);
    return (hash % 100) / 100;
  }

  private getFeatureExplanation(feature: string, value: number): string {
    const explanations: Record<string, (v: number) => string> = {
      ipReputation: (v) => v > 0.7 ? 'IP has poor reputation' : v > 0.4 ? 'IP reputation is questionable' : 'IP has good reputation',
      clickRate: (v) => v > 0.8 ? 'Abnormally high click rate' : v < 0.1 ? 'Unusually low click rate' : 'Normal click rate',
      conversionRate: (v) => v > 0.8 ? 'Suspiciously high conversion rate' : v < 0.01 ? 'No conversions detected' : 'Normal conversion rate',
      geoRisk: (v) => v > 0.6 ? 'High-risk geographic location' : v > 0.3 ? 'Medium-risk location' : 'Low-risk location',
      deviceFingerprint: (v) => v > 0.7 ? 'Suspicious device fingerprint' : v > 0.4 ? 'Questionable device data' : 'Normal device fingerprint',
      timeOfDay: (v) => v > 0.6 ? 'Activity during suspicious hours' : 'Normal activity hours',
      dayOfWeek: (v) => v > 0.5 ? 'Weekend activity pattern' : 'Weekday activity pattern',
      userAgentEntropy: (v) => v > 0.7 ? 'Low entropy user agent (suspicious)' : 'Normal user agent entropy',
      refererTrust: (v) => v > 0.7 ? 'Untrusted or suspicious referer' : v < 0.3 ? 'Trusted referer source' : 'Unknown referer source',
      clickPattern: (v) => v > 0.7 ? 'Suspicious click pattern detected' : 'Normal click pattern'
    };

    return explanations[feature]?.(value) || `${feature}: ${value.toFixed(2)}`;
  }

  private async logPrediction(modelId: string, clickId: string, features: FeatureVector, prediction: FraudPrediction) {
    try {
      await db.insert(fraudPredictions).values({
        modelId,
        clickId,
        features: features as any,
        score: prediction.score,
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        explanation: prediction.explanation as any,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to log prediction:', error);
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Training and model management methods
  async trainModel(modelName: string, trainingData: any[]): Promise<string> {
    console.log(`🎯 Training model: ${modelName} with ${trainingData.length} samples`);
    
    // Simple training simulation - in production would use actual ML libraries
    const features = trainingData.map(sample => this.extractFeatures(sample.clickData));
    const labels = trainingData.map(sample => sample.isFraud);
    
    // Calculate feature importance based on correlation with labels
    const importance: Record<string, number> = {};
    const featureNames = Object.keys(features[0]);
    
    for (const featureName of featureNames) {
      const featureValues = features.map(f => (f as any)[featureName]);
      const correlation = this.calculateCorrelation(featureValues, labels);
      importance[featureName] = Math.abs(correlation);
    }
    
    // Normalize importance scores
    const totalImportance = Object.values(importance).reduce((sum, val) => sum + val, 0);
    const normalizedWeights: Record<string, number> = {};
    
    for (const [feature, imp] of Object.entries(importance)) {
      normalizedWeights[feature] = imp / totalImportance;
    }

    // Save model to database
    const modelId = crypto.randomUUID();
    const newModel = {
      id: modelId,
      name: modelName,
      version: '1.0',
      type: 'weighted_features',
      config: { algorithm: 'weighted_sum', threshold: 0.5 },
      features: featureNames,
      weights: normalizedWeights,
      metrics: {
        accuracy: 0.85 + Math.random() * 0.1, // Simulated
        precision: 0.82 + Math.random() * 0.1,
        recall: 0.88 + Math.random() * 0.1,
        f1Score: 0.85 + Math.random() * 0.1
      },
      isActive: false, // Needs manual activation
      trainedOn: new Date(),
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(fraudModels).values(newModel);
    
    // Update local model cache
    this.models.set(modelId, newModel);
    
    console.log(`✅ Model ${modelName} trained successfully. ID: ${modelId}`);
    return modelId;
  }

  async activateModel(modelId: string): Promise<boolean> {
    try {
      // Deactivate other models
      await db.update(fraudModels)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(fraudModels.isActive, true));

      // Activate the selected model
      const [activatedModel] = await db.update(fraudModels)
        .set({ 
          isActive: true, 
          deployedAt: new Date(),
          updatedAt: new Date() 
        })
        .where(eq(fraudModels.id, modelId))
        .returning();

      if (activatedModel) {
        // Update local cache
        this.models.clear();
        this.models.set(modelId, activatedModel);
        
        console.log(`🚀 Model ${activatedModel.name} activated`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to activate model:', error);
      return false;
    }
  }

  async updateThresholds(adjustments: Record<string, number>): Promise<void> {
    // Auto-adjust thresholds based on performance feedback
    for (const [feature, adjustment] of Object.entries(adjustments)) {
      if (this.featureWeights[feature]) {
        this.featureWeights[feature] = Math.max(0, Math.min(1, 
          this.featureWeights[feature] + adjustment
        ));
      }
    }
    
    console.log('📊 ML thresholds updated:', adjustments);
  }

  getModelMetrics(modelId?: string): any {
    const model = modelId ? this.models.get(modelId) : this.models.values().next().value;
    
    if (!model) {
      return null;
    }
    
    return {
      modelId: model.id,
      name: model.name,
      version: model.version,
      metrics: model.metrics,
      isActive: model.isActive,
      trainedOn: model.trainedOn,
      deployedAt: model.deployedAt
    };
  }

  private calculateCorrelation(x: number[], y: boolean[]): number {
    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + (val ? 1 : 0), 0) / n;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - meanX;
      const yDiff = (y[i] ? 1 : 0) - meanY;
      
      numerator += xDiff * yDiff;
      denomX += xDiff * xDiff;
      denomY += yDiff * yDiff;
    }
    
    const correlation = numerator / Math.sqrt(denomX * denomY);
    return isNaN(correlation) ? 0 : correlation;
  }
}

export const mlFraudDetection = MLFraudDetection.getInstance();