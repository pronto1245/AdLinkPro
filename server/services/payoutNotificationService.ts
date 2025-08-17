import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, payoutRequests } from "@shared/schema";

export interface NotificationData {
  userId: string;
  type: 'payout_created' | 'payout_approved' | 'payout_rejected' | 'payout_processing' | 'payout_completed' | 'payout_failed';
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class PayoutNotificationService {
  // Send notification to partner about payout status change
  static async notifyPartner(payoutRequestId: string, status: string, message?: string): Promise<void> {
    try {
      const payoutRequest = await db
        .select({
          id: payoutRequests.id,
          partnerId: payoutRequests.partnerId,
          amount: payoutRequests.amount,
          currency: payoutRequests.currency,
          status: payoutRequests.status,
          rejectionReason: payoutRequests.rejectionReason,
        })
        .from(payoutRequests)
        .where(eq(payoutRequests.id, payoutRequestId))
        .limit(1);

      if (payoutRequest.length === 0) {
        console.error("Payout request not found for notification:", payoutRequestId);
        return;
      }

      const request = payoutRequest[0];
      
      const partner = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          telegramChatId: users.telegramChatId,
        })
        .from(users)
        .where(eq(users.id, request.partnerId))
        .limit(1);

      if (partner.length === 0) {
        console.error("Partner not found for notification:", request.partnerId);
        return;
      }

      const partnerData = partner[0];
      
      const notification = this.createNotificationForStatus(status, request, message);
      
      // Send email notification
      await this.sendEmailNotification(partnerData.email, notification);
      
      // Send in-app notification (if implemented)
      await this.sendInAppNotification(partnerData.id, notification);
      
      // Send Telegram notification (if Telegram chat ID exists)
      if (partnerData.telegramChatId) {
        await this.sendTelegramNotification(partnerData.telegramChatId, notification);
      }

    } catch (error) {
      console.error("Error sending payout notification:", error);
    }
  }

  // Send notification to advertiser about new payout request
  static async notifyAdvertiser(payoutRequestId: string): Promise<void> {
    try {
      const payoutRequest = await db
        .select({
          id: payoutRequests.id,
          advertiserId: payoutRequests.advertiserId,
          partnerId: payoutRequests.partnerId,
          amount: payoutRequests.amount,
          currency: payoutRequests.currency,
        })
        .from(payoutRequests)
        .where(eq(payoutRequests.id, payoutRequestId))
        .limit(1);

      if (payoutRequest.length === 0) return;

      const request = payoutRequest[0];
      
      const [advertiser, partner] = await Promise.all([
        db.select({
          id: users.id,
          email: users.email,
          username: users.username,
        })
        .from(users)
        .where(eq(users.id, request.advertiserId))
        .limit(1),
        
        db.select({
          username: users.username,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, request.partnerId))
        .limit(1)
      ]);

      if (advertiser.length === 0 || partner.length === 0) return;

      const notification: NotificationData = {
        userId: advertiser[0].id,
        type: 'payout_created',
        title: 'New Payout Request',
        message: `Partner ${partner[0].username} requested a payout of ${request.amount} ${request.currency}`,
        data: {
          payoutRequestId: request.id,
          partnerId: request.partnerId,
          partnerUsername: partner[0].username,
          amount: request.amount,
          currency: request.currency,
        }
      };

      await this.sendEmailNotification(advertiser[0].email, notification);
      await this.sendInAppNotification(advertiser[0].id, notification);

    } catch (error) {
      console.error("Error sending advertiser notification:", error);
    }
  }

  private static createNotificationForStatus(status: string, request: any, customMessage?: string): NotificationData {
    const baseData = {
      userId: request.partnerId,
      data: {
        payoutRequestId: request.id,
        amount: request.amount,
        currency: request.currency,
        status: status,
      }
    };

    switch (status) {
      case 'approved':
        return {
          ...baseData,
          type: 'payout_approved',
          title: 'Payout Request Approved',
          message: customMessage || `Your payout request of ${request.amount} ${request.currency} has been approved and will be processed soon.`,
        };
      
      case 'rejected':
        return {
          ...baseData,
          type: 'payout_rejected',
          title: 'Payout Request Rejected',
          message: customMessage || request.rejectionReason || `Your payout request of ${request.amount} ${request.currency} has been rejected.`,
        };
      
      case 'processing':
        return {
          ...baseData,
          type: 'payout_processing',
          title: 'Payout Processing',
          message: customMessage || `Your payout of ${request.amount} ${request.currency} is being processed.`,
        };
      
      case 'completed':
        return {
          ...baseData,
          type: 'payout_completed',
          title: 'Payout Completed',
          message: customMessage || `Your payout of ${request.amount} ${request.currency} has been completed successfully.`,
        };
      
      case 'failed':
        return {
          ...baseData,
          type: 'payout_failed',
          title: 'Payout Failed',
          message: customMessage || `Your payout of ${request.amount} ${request.currency} has failed. Please contact support.`,
        };
      
      default:
        return {
          ...baseData,
          type: 'payout_created',
          title: 'Payout Status Updated',
          message: customMessage || `Your payout request status has been updated to ${status}.`,
        };
    }
  }

  private static async sendEmailNotification(email: string, notification: NotificationData): Promise<void> {
    try {
      // In a production environment, integrate with email service (SendGrid, AWS SES, etc.)
      console.log(`Would send email to ${email}:`);
      console.log(`Subject: ${notification.title}`);
      console.log(`Message: ${notification.message}`);
      
      // Mock implementation - replace with actual email service
      const emailHTML = this.generateEmailTemplate(notification);
      
      // Example SendGrid integration:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // await sgMail.send({
      //   to: email,
      //   from: 'noreply@adlinkpro.com',
      //   subject: notification.title,
      //   html: emailHTML,
      // });

    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  }

  private static async sendInAppNotification(userId: string, notification: NotificationData): Promise<void> {
    try {
      // Store in-app notification in database
      // This would typically be stored in a notifications table
      console.log(`In-app notification for user ${userId}:`, notification);
      
      // In a real implementation, you would:
      // 1. Store the notification in a notifications table
      // 2. Send via WebSocket to connected clients
      // 3. Update notification count/badge
      
    } catch (error) {
      console.error("Error sending in-app notification:", error);
    }
  }

  private static async sendTelegramNotification(chatId: number, notification: NotificationData): Promise<void> {
    try {
      // In a production environment, integrate with Telegram Bot API
      console.log(`Would send Telegram message to chat ${chatId}:`);
      console.log(`${notification.title}: ${notification.message}`);
      
      // Example Telegram Bot API integration:
      // const fetch = require('node-fetch');
      // const botToken = process.env.TELEGRAM_BOT_TOKEN;
      // const text = `🔔 ${notification.title}\n\n${notification.message}`;
      // 
      // await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     chat_id: chatId,
      //     text: text,
      //     parse_mode: 'HTML',
      //   }),
      // });

    } catch (error) {
      console.error("Error sending Telegram notification:", error);
    }
  }

  private static generateEmailTemplate(notification: NotificationData): string {
    const statusColors = {
      payout_created: '#3b82f6',
      payout_approved: '#10b981',
      payout_rejected: '#ef4444',
      payout_processing: '#f59e0b',
      payout_completed: '#10b981',
      payout_failed: '#ef4444',
    };

    const color = statusColors[notification.type] || '#6b7280';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                margin: 0; 
                padding: 0; 
                background-color: #f8fafc;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
            }
            .card {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: ${color};
                color: white;
                padding: 20px;
                text-align: center;
            }
            .content {
                padding: 30px;
            }
            .footer {
                background: #f8fafc;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #6b7280;
            }
            .button {
                display: inline-block;
                background: ${color};
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <h1 style="margin: 0;">${notification.title}</h1>
                </div>
                <div class="content">
                    <p>${notification.message}</p>
                    ${notification.data ? `
                    <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">Details:</h3>
                        ${notification.data.amount && notification.data.currency ? 
                          `<p><strong>Amount:</strong> ${notification.data.amount} ${notification.data.currency}</p>` : ''}
                        ${notification.data.status ? 
                          `<p><strong>Status:</strong> ${notification.data.status}</p>` : ''}
                    </div>
                    ` : ''}
                    <a href="${process.env.CLIENT_URL || 'https://app.adlinkpro.com'}/affiliate/payouts" class="button">
                        View Payout Requests
                    </a>
                </div>
                <div class="footer">
                    <p>This notification was sent by AdLinkPro platform.</p>
                    <p>If you have any questions, please contact our support team.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

export default PayoutNotificationService;