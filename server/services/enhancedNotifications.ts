import { telegramBot } from './telegramBot';
import { sendEmail } from './email';
import { db } from '../db';
import { notifications, fraudAlerts, users } from '@shared/schema';
import { userNotifications } from '@shared/antifraud-schema';
import { eq } from 'drizzle-orm';

export interface SlackMessage {
  text: string;
  channel?: string;
  username?: string;
  icon_emoji?: string;
  attachments?: Array<{
    color?: string;
    fields?: Array<{
      title: string;
      value: string;
      short?: boolean;
    }>;
    footer?: string;
    ts?: number;
  }>;
}

export interface WebhookEvent {
  type: 'fraud_detected' | 'conversion_created' | 'user_blocked' | 'threshold_exceeded' | 'system_alert';
  data: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  userId?: string;
}

export interface NotificationChannel {
  type: 'email' | 'telegram' | 'slack' | 'webhook';
  enabled: boolean;
  config: any;
}

export interface NotificationRule {
  id: string;
  name: string;
  eventTypes: string[];
  channels: NotificationChannel[];
  conditions?: {
    severity?: string[];
    userRoles?: string[];
    threshold?: number;
  };
  isActive: boolean;
  cooldownMinutes?: number;
  lastTriggered?: Date;
}

export class EnhancedNotificationService {
  private static instance: EnhancedNotificationService;
  private notificationRules: NotificationRule[] = [];
  private webhookQueue: WebhookEvent[] = [];

  static getInstance(): EnhancedNotificationService {
    if (!EnhancedNotificationService.instance) {
      EnhancedNotificationService.instance = new EnhancedNotificationService();
    }
    return EnhancedNotificationService.instance;
  }

  constructor() {
    this.loadDefaultRules();
    this.startWebhookProcessor();
  }

  private loadDefaultRules() {
    this.notificationRules = [
      {
        id: 'fraud_high_severity',
        name: 'High Severity Fraud Detection',
        eventTypes: ['fraud_detected'],
        channels: [
          {
            type: 'telegram',
            enabled: true,
            config: { adminOnly: true }
          },
          {
            type: 'slack',
            enabled: true,
            config: { channel: '#fraud-alerts' }
          },
          {
            type: 'email',
            enabled: true,
            config: { recipients: ['admin@platform.com'] }
          }
        ],
        conditions: {
          severity: ['high', 'critical']
        },
        isActive: true,
        cooldownMinutes: 5
      },
      {
        id: 'conversion_notifications',
        name: 'Conversion Notifications',
        eventTypes: ['conversion_created'],
        channels: [
          {
            type: 'telegram',
            enabled: true,
            config: { userSpecific: true }
          },
          {
            type: 'webhook',
            enabled: true,
            config: { url: process.env.CONVERSION_WEBHOOK_URL }
          }
        ],
        isActive: true
      },
      {
        id: 'system_alerts',
        name: 'System Alerts',
        eventTypes: ['threshold_exceeded', 'system_alert'],
        channels: [
          {
            type: 'slack',
            enabled: true,
            config: { channel: '#system-alerts' }
          },
          {
            type: 'email',
            enabled: true,
            config: { recipients: ['admin@platform.com', 'tech@platform.com'] }
          }
        ],
        conditions: {
          severity: ['medium', 'high', 'critical']
        },
        isActive: true,
        cooldownMinutes: 15
      }
    ];
  }

  private startWebhookProcessor() {
    setInterval(() => {
      this.processWebhookQueue();
    }, 1000); // Process every second
  }

  async sendWebhookEvent(event: WebhookEvent): Promise<void> {
    this.webhookQueue.push(event);
  }

  private async processWebhookQueue(): Promise<void> {
    while (this.webhookQueue.length > 0) {
      const event = this.webhookQueue.shift();
      if (event) {
        await this.processEvent(event);
      }
    }
  }

  private async processEvent(event: WebhookEvent): Promise<void> {
    const applicableRules = this.notificationRules.filter(rule => 
      rule.isActive && 
      rule.eventTypes.includes(event.type) &&
      this.checkConditions(rule, event) &&
      this.checkCooldown(rule)
    );

    for (const rule of applicableRules) {
      await this.executeRule(rule, event);
      rule.lastTriggered = new Date();
    }
  }

  private checkConditions(rule: NotificationRule, event: WebhookEvent): boolean {
    if (!rule.conditions) return true;

    if (rule.conditions.severity && !rule.conditions.severity.includes(event.severity)) {
      return false;
    }

    if (rule.conditions.threshold && event.data.value && event.data.value < rule.conditions.threshold) {
      return false;
    }

    return true;
  }

  private checkCooldown(rule: NotificationRule): boolean {
    if (!rule.cooldownMinutes || !rule.lastTriggered) return true;
    
    const cooldownMs = rule.cooldownMinutes * 60 * 1000;
    const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
    
    return timeSinceLastTrigger >= cooldownMs;
  }

  private async executeRule(rule: NotificationRule, event: WebhookEvent): Promise<void> {
    for (const channel of rule.channels) {
      if (!channel.enabled) continue;

      try {
        switch (channel.type) {
          case 'email':
            await this.sendEmailNotification(channel, event);
            break;
          case 'telegram':
            await this.sendTelegramNotification(channel, event);
            break;
          case 'slack':
            await this.sendSlackNotification(channel, event);
            break;
          case 'webhook':
            await this.sendWebhookNotification(channel, event);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel.type} notification:`, error);
      }
    }
  }

  private async sendEmailNotification(channel: NotificationChannel, event: WebhookEvent): Promise<void> {
    const subject = this.generateEmailSubject(event);
    const html = this.generateEmailHtml(event);
    
    const recipients = channel.config.recipients || [process.env.ADMIN_EMAIL];
    
    for (const recipient of recipients) {
      await sendEmail({
        to: recipient,
        from: process.env.FROM_EMAIL || 'noreply@platform.com',
        subject,
        html
      });
    }
  }

  private async sendTelegramNotification(channel: NotificationChannel, event: WebhookEvent): Promise<void> {
    if (channel.config.adminOnly) {
      const adminUsers = await db.select()
        .from(users)
        .where(eq(users.role, 'admin'));
        
      for (const admin of adminUsers) {
        if (admin.telegramChatId) {
          const message = this.generateTelegramMessage(event);
          await telegramBot.sendMessage(admin.telegramChatId, message);
        }
      }
    } else if (channel.config.userSpecific && event.userId) {
      const user = await db.select()
        .from(users)
        .where(eq(users.id, event.userId))
        .limit(1);
        
      if (user[0]?.telegramChatId) {
        const message = this.generateTelegramMessage(event);
        await telegramBot.sendMessage(user[0].telegramChatId, message);
      }
    }
  }

  private async sendSlackNotification(channel: NotificationChannel, event: WebhookEvent): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('SLACK_WEBHOOK_URL not configured');
      return;
    }

    const message = this.generateSlackMessage(event, channel.config.channel);
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  }

  private async sendWebhookNotification(channel: NotificationChannel, event: WebhookEvent): Promise<void> {
    const url = channel.config.url;
    if (!url) return;

    const payload = {
      event: event.type,
      data: event.data,
      timestamp: event.timestamp,
      severity: event.severity,
      source: event.source,
      userId: event.userId
    };

    await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Event-Type': event.type,
        'X-Severity': event.severity
      },
      body: JSON.stringify(payload)
    });
  }

  private generateEmailSubject(event: WebhookEvent): string {
    const severityEmoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴',
      critical: '🚨'
    };

    switch (event.type) {
      case 'fraud_detected':
        return `${severityEmoji[event.severity]} Fraud Alert - ${event.data.type}`;
      case 'conversion_created':
        return `💰 New Conversion - ${event.data.amount} ${event.data.currency}`;
      case 'user_blocked':
        return `🚫 User Blocked - ${event.data.username}`;
      case 'threshold_exceeded':
        return `📊 Threshold Exceeded - ${event.data.metric}`;
      case 'system_alert':
        return `⚠️ System Alert - ${event.data.message}`;
      default:
        return `📢 Platform Event - ${event.type}`;
    }
  }

  private generateEmailHtml(event: WebhookEvent): string {
    const timestamp = event.timestamp.toLocaleString('ru-RU');
    
    switch (event.type) {
      case 'fraud_detected':
        return `
          <h2>🔴 Fraud Detection Alert</h2>
          <p><strong>Type:</strong> ${event.data.type}</p>
          <p><strong>IP Address:</strong> ${event.data.ipAddress}</p>
          <p><strong>Risk Score:</strong> ${event.data.riskScore}</p>
          <p><strong>Country:</strong> ${event.data.country}</p>
          <p><strong>User Agent:</strong> ${event.data.userAgent}</p>
          <p><strong>Timestamp:</strong> ${timestamp}</p>
          <p><strong>Actions Taken:</strong> ${event.data.actions?.join(', ') || 'None'}</p>
        `;
      case 'conversion_created':
        return `
          <h2>💰 New Conversion</h2>
          <p><strong>Amount:</strong> ${event.data.amount} ${event.data.currency}</p>
          <p><strong>Offer:</strong> ${event.data.offerName}</p>
          <p><strong>Partner:</strong> ${event.data.partnerName}</p>
          <p><strong>Country:</strong> ${event.data.country}</p>
          <p><strong>Timestamp:</strong> ${timestamp}</p>
        `;
      default:
        return `
          <h2>📢 Platform Event</h2>
          <p><strong>Type:</strong> ${event.type}</p>
          <p><strong>Severity:</strong> ${event.severity}</p>
          <p><strong>Data:</strong> ${JSON.stringify(event.data, null, 2)}</p>
          <p><strong>Timestamp:</strong> ${timestamp}</p>
        `;
    }
  }

  private generateTelegramMessage(event: WebhookEvent): string {
    const severityEmoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴',
      critical: '🚨'
    };

    const timestamp = event.timestamp.toLocaleString('ru-RU');

    switch (event.type) {
      case 'fraud_detected':
        return `
${severityEmoji[event.severity]} <b>FRAUD ALERT</b>

⚠️ <b>Type:</b> ${event.data.type}
🌐 <b>IP:</b> ${event.data.ipAddress}
📊 <b>Risk Score:</b> ${event.data.riskScore}%
🌍 <b>Country:</b> ${event.data.country}
🤖 <b>Bot:</b> ${event.data.isBot ? 'Yes' : 'No'}
🔒 <b>VPN:</b> ${event.data.vpnDetected ? 'Yes' : 'No'}

⏰ <b>Time:</b> ${timestamp}
        `;
        
      case 'conversion_created':
        return `
💰 <b>NEW CONVERSION</b>

💵 <b>Amount:</b> ${event.data.amount} ${event.data.currency}
🎯 <b>Offer:</b> ${event.data.offerName}
👤 <b>Partner:</b> ${event.data.partnerName}
🌍 <b>Country:</b> ${event.data.country}

⏰ <b>Time:</b> ${timestamp}
        `;
        
      case 'threshold_exceeded':
        return `
📊 <b>THRESHOLD EXCEEDED</b>

📈 <b>Metric:</b> ${event.data.metric}
🎯 <b>Current Value:</b> ${event.data.currentValue}
⚠️ <b>Threshold:</b> ${event.data.threshold}
📊 <b>Increase:</b> +${event.data.increase}%

⏰ <b>Time:</b> ${timestamp}
        `;
        
      default:
        return `
${severityEmoji[event.severity]} <b>SYSTEM EVENT</b>

📢 <b>Type:</b> ${event.type}
📝 <b>Message:</b> ${event.data.message || 'No description'}

⏰ <b>Time:</b> ${timestamp}
        `;
    }
  }

  private generateSlackMessage(event: WebhookEvent, channel?: string): SlackMessage {
    const colorMap = {
      low: '#36a64f',      // green
      medium: '#ff9500',   // orange
      high: '#ff0000',     // red
      critical: '#8B0000'  // dark red
    };

    return {
      text: `${event.type.replace('_', ' ').toUpperCase()} Alert`,
      channel: channel || '#general',
      username: 'AntifraudBot',
      icon_emoji: ':robot_face:',
      attachments: [{
        color: colorMap[event.severity],
        fields: [
          {
            title: 'Event Type',
            value: event.type,
            short: true
          },
          {
            title: 'Severity',
            value: event.severity.toUpperCase(),
            short: true
          },
          {
            title: 'Source',
            value: event.source,
            short: true
          },
          {
            title: 'Timestamp',
            value: event.timestamp.toISOString(),
            short: true
          },
          {
            title: 'Details',
            value: `\`\`\`${JSON.stringify(event.data, null, 2)}\`\`\``,
            short: false
          }
        ],
        footer: 'AntifraudPlatform',
        ts: Math.floor(event.timestamp.getTime() / 1000)
      }]
    };
  }

  // Public API methods
  async notifyFraudDetected(data: {
    type: string;
    ipAddress: string;
    riskScore: number;
    country: string;
    userAgent: string;
    isBot: boolean;
    vpnDetected: boolean;
    userId?: string;
  }): Promise<void> {
    const severity = data.riskScore >= 80 ? 'critical' : 
                     data.riskScore >= 60 ? 'high' :
                     data.riskScore >= 40 ? 'medium' : 'low';

    await this.sendWebhookEvent({
      type: 'fraud_detected',
      data,
      timestamp: new Date(),
      severity,
      source: 'antifraud-engine',
      userId: data.userId
    });
  }

  async notifyConversionCreated(data: {
    amount: number;
    currency: string;
    offerName: string;
    partnerName: string;
    country: string;
    userId: string;
  }): Promise<void> {
    await this.sendWebhookEvent({
      type: 'conversion_created',
      data,
      timestamp: new Date(),
      severity: 'low',
      source: 'conversion-tracker',
      userId: data.userId
    });
  }

  async notifyUserBlocked(data: {
    username: string;
    reason: string;
    adminId: string;
  }): Promise<void> {
    await this.sendWebhookEvent({
      type: 'user_blocked',
      data,
      timestamp: new Date(),
      severity: 'medium',
      source: 'user-management'
    });
  }

  async notifyThresholdExceeded(data: {
    metric: string;
    currentValue: number;
    threshold: number;
    increase: number;
  }): Promise<void> {
    const severity = data.increase >= 100 ? 'critical' :
                     data.increase >= 50 ? 'high' :
                     data.increase >= 25 ? 'medium' : 'low';

    await this.sendWebhookEvent({
      type: 'threshold_exceeded',
      data,
      timestamp: new Date(),
      severity,
      source: 'metrics-monitor'
    });
  }

  async notifySystemAlert(data: {
    message: string;
    component: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    await this.sendWebhookEvent({
      type: 'system_alert',
      data,
      timestamp: new Date(),
      severity: data.severity,
      source: 'system-monitor'
    });
  }

  // Configuration methods
  async addNotificationRule(rule: Omit<NotificationRule, 'id'>): Promise<string> {
    const id = Date.now().toString();
    this.notificationRules.push({ ...rule, id });
    return id;
  }

  async updateNotificationRule(id: string, updates: Partial<NotificationRule>): Promise<boolean> {
    const index = this.notificationRules.findIndex(rule => rule.id === id);
    if (index === -1) return false;
    
    this.notificationRules[index] = { ...this.notificationRules[index], ...updates };
    return true;
  }

  async deleteNotificationRule(id: string): Promise<boolean> {
    const index = this.notificationRules.findIndex(rule => rule.id === id);
    if (index === -1) return false;
    
    this.notificationRules.splice(index, 1);
    return true;
  }

  getNotificationRules(): NotificationRule[] {
    return [...this.notificationRules];
  }
}

export const enhancedNotificationService = EnhancedNotificationService.getInstance();