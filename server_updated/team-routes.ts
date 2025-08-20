import { Express } from "express";

// Простые роуты команды без middleware для отладки
export function setupTeamRoutes(app: Express) {
  // Получить список участников команды
  app.get("/api/advertiser/team/members", async (req, res) => {
    console.log('=== GET TEAM MEMBERS - NO MIDDLEWARE ===');
    
    try {
      // Mock данные для демонстрации
      const mockTeamMembers = [
        {
          id: 'member_1',
          username: 'ivan_petrov',
          email: 'ivan@example.com',
          firstName: 'Иван',
          lastName: 'Петров',
          role: 'manager',
          status: 'active',
          permissions: {
            manageOffers: true,
            managePartners: true,
            viewStatistics: true,
            financialOperations: false,
            postbacksApi: false
          },
          restrictions: {
            ipWhitelist: ['192.168.1.100'],
            geoRestrictions: ['RU'],
            timeRestrictions: {
              enabled: true,
              startTime: '09:00',
              endTime: '18:00',
              timezone: 'UTC+3',
              workingDays: [1, 2, 3, 4, 5]
            }
          },
          telegramNotifications: true,
          telegramUserId: '123456789',
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          createdBy: "temp_advertiser_id"
        },
        {
          id: 'member_2',
          username: 'maria_sidorova',
          email: 'maria@example.com',
          firstName: 'Мария',
          lastName: 'Сидорова',
          role: 'analyst',
          status: 'active',
          permissions: {
            manageOffers: false,
            managePartners: false,
            viewStatistics: true,
            financialOperations: false,
            postbacksApi: false
          },
          restrictions: {
            ipWhitelist: [],
            geoRestrictions: [],
            timeRestrictions: {
              enabled: false,
              startTime: '09:00',
              endTime: '18:00',
              timezone: 'UTC+3',
              workingDays: [1, 2, 3, 4, 5]
            }
          },
          telegramNotifications: false,
          lastActivity: new Date(Date.now() - 7200000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          createdBy: "temp_advertiser_id"
        }
      ];
      
      console.log('Returning', mockTeamMembers.length, 'team members');
      res.json(mockTeamMembers);
    } catch (error) {
      console.error("Get team members error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Создать участника команды
  app.post("/api/advertiser/team/members", async (req, res) => {
    console.log('=== CREATE TEAM MEMBER - NO MIDDLEWARE ===');
    console.log('Request body:', req.body);
    
    try {
      const { username, email, firstName, lastName, role, permissions } = req.body;
      
      // Validate required fields
      if (!username || !email || !firstName || !lastName || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Create new member (mock response)
      const newMember = {
        id: `member_${Date.now()}`,
        username,
        email,
        firstName,
        lastName,
        role,
        status: 'active',
        permissions: permissions || {
          manageOffers: false,
          managePartners: false,
          viewStatistics: true,
          financialOperations: false,
          postbacksApi: false
        },
        restrictions: {
          ipWhitelist: [],
          geoRestrictions: [],
          timeRestrictions: {
            enabled: false,
            startTime: '09:00',
            endTime: '18:00',
            timezone: 'UTC+3',
            workingDays: [1, 2, 3, 4, 5]
          }
        },
        telegramNotifications: false,
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: "temp_advertiser_id"
      };
      
      console.log('Created team member:', newMember);
      res.status(201).json(newMember);
    } catch (error) {
      console.error("Create team member error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Отправить приглашение
  app.post("/api/advertiser/team/invite", async (req, res) => {
    console.log('=== TEAM INVITE - NO MIDDLEWARE ===');
    console.log('Request body:', req.body);
    
    try {
      const { email, role } = req.body;
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      // Mock invitation process
      const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`Team invitation sent to ${email} with role ${role}`);
      
      res.status(201).json({
        invitationId,
        email,
        role,
        message: 'Invitation sent successfully'
      });
    } catch (error) {
      console.error("Invite team member error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Получить логи активности команды
  app.get("/api/advertiser/team/activity-logs", async (req, res) => {
    console.log('=== GET ACTIVITY LOGS - NO MIDDLEWARE ===');
    
    try {
      // Mock activity logs
      const mockLogs = [
        {
          id: 'log_1',
          userId: 'member_1',
          username: 'ivan_petrov',
          action: 'login',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          details: 'Successful login'
        },
        {
          id: 'log_2',
          userId: 'member_2',
          username: 'maria_sidorova',
          action: 'view_statistics',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          details: 'Viewed analytics dashboard'
        }
      ];
      
      console.log('Returning', mockLogs.length, 'activity logs');
      res.json(mockLogs);
    } catch (error) {
      console.error("Get activity logs error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Экспорт данных команды
  app.get("/api/advertiser/team/export", async (req, res) => {
    console.log('=== TEAM EXPORT - NO MIDDLEWARE ===');
    
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalMembers: 2,
        activeMembers: 2,
        inactiveMembers: 0,
        members: [
          {
            username: 'ivan_petrov',
            email: 'ivan@example.com',
            role: 'manager',
            status: 'active',
            lastActivity: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      };
      
      console.log('Exporting team data');
      res.json(exportData);
    } catch (error) {
      console.error("Team export error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
}