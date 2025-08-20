import { Express } from "express";

// Unified team member interface
interface TeamMember {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'buyer' | 'analyst' | 'manager' | 'financier' | 'support';
  permissions: string[] | TeamPermissions;
  restrictions?: TeamRestrictions;
  subIdPrefix?: string; // For affiliate teams
  isActive: boolean;
  status: 'active' | 'inactive' | 'blocked';
  telegramNotifications?: boolean;
  telegramUserId?: string;
  lastActivity: string;
  createdAt: string;
  createdBy: string;
}

interface TeamPermissions {
  manageOffers?: boolean;
  managePartners?: boolean;
  viewStatistics?: boolean;
  financialOperations?: boolean;
  postbacksApi?: boolean;
  // Affiliate-specific permissions
  view_offers?: boolean;
  generate_links?: boolean;
  view_creatives?: boolean;
  view_payouts?: boolean;
  manage_team?: boolean;
}

interface TeamRestrictions {
  ipWhitelist: string[];
  geoRestrictions: string[];
  timeRestrictions: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    workingDays: number[];
  };
}

interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  result: 'success' | 'failed' | 'warning';
}

// Team management routes with unified support for affiliate and advertiser
export function setupTeamRoutes(app: Express) {
  // AFFILIATE TEAM ROUTES
  // Get affiliate team members
  app.get("/api/affiliate/team", async (req, res) => {
    console.log('=== GET AFFILIATE TEAM MEMBERS ===');
    
    try {
      // Mock data for affiliate team (simpler structure)
      const mockTeamMembers: TeamMember[] = [
        {
          id: 'affiliate_member_1',
          userId: 'user_1',
          username: 'buyer_ivan',
          email: 'ivan.buyer@example.com',
          role: 'buyer',
          permissions: ['view_offers', 'generate_links', 'view_statistics'],
          subIdPrefix: 'buyer1',
          isActive: true,
          status: 'active',
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          createdBy: "affiliate_owner_id"
        },
        {
          id: 'affiliate_member_2',
          userId: 'user_2', 
          username: 'analyst_maria',
          email: 'maria.analyst@example.com',
          role: 'analyst',
          permissions: ['view_offers', 'view_statistics', 'view_creatives'],
          subIdPrefix: 'analyst1',
          isActive: true,
          status: 'active',
          lastActivity: new Date(Date.now() - 7200000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          createdBy: "affiliate_owner_id"
        }
      ];
      
      console.log('Returning', mockTeamMembers.length, 'affiliate team members');
      res.json(mockTeamMembers);
    } catch (error) {
      console.error("Get affiliate team members error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Create affiliate team member
  app.post("/api/affiliate/team", async (req, res) => {
    console.log('=== CREATE AFFILIATE TEAM MEMBER ===');
    console.log('Request body:', req.body);
    
    try {
      const { email, username, password, role, permissions, subIdPrefix } = req.body;
      
      // Validate required fields for affiliate
      if (!email || !username || !password || !role) {
        return res.status(400).json({ error: "Missing required fields: email, username, password, role" });
      }
      
      // Create new affiliate member
      const newMember: TeamMember = {
        id: `affiliate_member_${Date.now()}`,
        userId: `user_${Date.now()}`,
        username,
        email,
        role: role as any,
        permissions: permissions || [],
        subIdPrefix: subIdPrefix || username,
        isActive: true,
        status: 'active',
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: "affiliate_owner_id"
      };
      
      console.log('Created affiliate team member:', newMember);
      res.status(201).json(newMember);
    } catch (error) {
      console.error("Create affiliate team member error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Update affiliate team member
  app.patch("/api/affiliate/team/:id", async (req, res) => {
    console.log('=== UPDATE AFFILIATE TEAM MEMBER ===');
    console.log('Member ID:', req.params.id);
    console.log('Update data:', req.body);
    
    try {
      const memberId = req.params.id;
      const updateData = req.body;
      
      // Mock update - in real app would update database
      const updatedMember = {
        id: memberId,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updated affiliate member:', updatedMember);
      res.json(updatedMember);
    } catch (error) {
      console.error("Update affiliate team member error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Delete affiliate team member
  app.delete("/api/affiliate/team/:id", async (req, res) => {
    console.log('=== DELETE AFFILIATE TEAM MEMBER ===');
    console.log('Member ID:', req.params.id);
    
    try {
      const memberId = req.params.id;
      
      // Mock deletion - in real app would remove from database
      console.log('Deleted affiliate member:', memberId);
      res.json({ success: true, message: 'Team member deleted successfully' });
    } catch (error) {
      console.error("Delete affiliate team member error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // ADVERTISER TEAM ROUTES
  // ADVERTISER TEAM ROUTES
  // Get advertiser team members
  app.get("/api/advertiser/team/members", async (req, res) => {
    console.log('=== GET ADVERTISER TEAM MEMBERS ===');
    
    try {
      // Mock data for advertiser team (more complex structure with restrictions)
      const mockTeamMembers: TeamMember[] = [
        {
          id: 'advertiser_member_1',
          userId: 'user_3',
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
          isActive: true,
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          createdBy: "advertiser_owner_id"
        },
        {
          id: 'advertiser_member_2',
          userId: 'user_4',
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
          isActive: true,
          lastActivity: new Date(Date.now() - 7200000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          createdBy: "advertiser_owner_id"
        }
      ];
      
      console.log('Returning', mockTeamMembers.length, 'advertiser team members');
      res.json(mockTeamMembers);
    } catch (error) {
      console.error("Get advertiser team members error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Create advertiser team member
  app.post("/api/advertiser/team/members", async (req, res) => {
    console.log('=== CREATE ADVERTISER TEAM MEMBER ===');
    console.log('Request body:', req.body);
    
    try {
      const memberData = req.body;
      
      // Validate required fields
      if (!memberData.username || !memberData.email || !memberData.role) {
        return res.status(400).json({ error: "Missing required fields: username, email, role" });
      }
      
      // Create new advertiser member with full structure
      const newMember: TeamMember = {
        id: `advertiser_member_${Date.now()}`,
        userId: `user_${Date.now()}`,
        username: memberData.username,
        email: memberData.email,
        firstName: memberData.firstName || '',
        lastName: memberData.lastName || '',
        role: memberData.role,
        status: 'active',
        permissions: memberData.permissions || {
          manageOffers: false,
          managePartners: false,
          viewStatistics: true,
          financialOperations: false,
          postbacksApi: false
        },
        restrictions: memberData.restrictions || {
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
        telegramNotifications: memberData.telegramNotifications || false,
        telegramUserId: memberData.telegramUserId || '',
        isActive: true,
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: "advertiser_owner_id"
      };
      
      console.log('Created advertiser team member:', newMember);
      res.status(201).json(newMember);
    } catch (error) {
      console.error("Create advertiser team member error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Update advertiser team member
  app.patch("/api/advertiser/team/members/:id", async (req, res) => {
    console.log('=== UPDATE ADVERTISER TEAM MEMBER ===');
    console.log('Member ID:', req.params.id);
    console.log('Update data:', req.body);
    
    try {
      const memberId = req.params.id;
      const updateData = req.body;
      
      // Mock update with proper structure
      const updatedMember = {
        id: memberId,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updated advertiser member:', updatedMember);
      res.json(updatedMember);
    } catch (error) {
      console.error("Update advertiser team member error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Delete advertiser team member
  app.delete("/api/advertiser/team/members/:id", async (req, res) => {
    console.log('=== DELETE ADVERTISER TEAM MEMBER ===');
    console.log('Member ID:', req.params.id);
    
    try {
      const memberId = req.params.id;
      
      // Mock deletion
      console.log('Deleted advertiser member:', memberId);
      res.json({ success: true, message: 'Team member deleted successfully' });
    } catch (error) {
      console.error("Delete advertiser team member error:", error);
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

  // Get team activity logs (enhanced)
  app.get("/api/advertiser/team/activity-logs", async (req, res) => {
    console.log('=== GET TEAM ACTIVITY LOGS ===');
    
    try {
      // Enhanced mock activity logs
      const mockLogs: ActivityLog[] = [
        {
          id: 'log_1',
          userId: 'advertiser_member_1',
          username: 'ivan_petrov',
          action: 'login',
          resource: 'system',
          details: 'Successful login to advertiser panel',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          result: 'success'
        },
        {
          id: 'log_2',
          userId: 'advertiser_member_2',
          username: 'maria_sidorova',
          action: 'view_statistics',
          resource: 'analytics',
          details: 'Viewed analytics dashboard for campaign #123',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (macOS) Chrome/91.0',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          result: 'success'
        },
        {
          id: 'log_3',
          userId: 'advertiser_member_1',
          username: 'ivan_petrov',
          action: 'manage_offers',
          resource: 'offers',
          details: 'Updated offer settings for offer #456',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          result: 'success'
        },
        {
          id: 'log_4',
          userId: 'advertiser_member_2',
          username: 'maria_sidorova',
          action: 'export_data',
          resource: 'reports',
          details: 'Failed to export campaign data - insufficient permissions',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (macOS) Chrome/91.0',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          result: 'failed'
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