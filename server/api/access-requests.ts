import { Express } from 'express';
import { authenticateToken, requireRole, getAuthenticatedUser } from '../middleware/auth';
import { storage } from '../storage';
import { randomUUID } from 'crypto';

export function setupAccessRequestsRoutes(app: Express) {

// Создание запроса доступа (для партнеров)
app.post('/api/access-requests', authenticateToken, requireRole(['affiliate']), async (req, res) => {
  try {
    const partnerId = getAuthenticatedUser(req).id;
    const { offerId, message } = req.body;
    
    if (!offerId) {
      return res.status(400).json({ error: "Offer ID is required" });
    }
    
    // Проверяем, что оффер существует
    const offer = await storage.getOffer(offerId);
    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }
    
    // Проверяем, что запрос еще не существует
    const existingRequests = await storage.getOfferAccessRequests(partnerId, offerId);
    if (existingRequests.length > 0) {
      return res.status(409).json({ error: "Access request already exists" });
    }
    
    // Создаем запрос
    const request = await storage.createOfferAccessRequest({
      id: randomUUID(),
      partnerId,
      offerId,
      advertiserId: offer.advertiserId,
      status: 'pending',
      requestNote: message || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(request);
  } catch (error) {
    console.error("Create offer access request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Получение запросов доступа (для партнеров)
app.get('/api/access-requests/partner', authenticateToken, requireRole(['affiliate']), async (req, res) => {
  try {
    const partnerId = getAuthenticatedUser(req).id;
    const requests = await storage.getOfferAccessRequests(partnerId);
    
    // Обогащаем данными офферов
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const offer = await storage.getOffer(request.offerId);
        const advertiser = await storage.getUser(request.advertiserId);
        
        return {
          ...request,
          offer: offer ? {
            id: offer.id,
            name: offer.name,
            category: offer.category,
            payoutType: offer.payoutType,
            payoutAmount: offer.payoutAmount,
            currency: offer.currency,
            logo: offer.logo,
            description: offer.description
          } : null,
          advertiser: advertiser ? {
            id: advertiser.id,
            username: advertiser.username,
            company: advertiser.company
          } : null
        };
      })
    );
    
    res.json(enrichedRequests);
  } catch (error) {
    console.error("Get partner access requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Получение запросов доступа (для рекламодателей)
app.get('/api/access-requests/advertiser', authenticateToken, requireRole(['advertiser']), async (req, res) => {
  try {
    const advertiserId = getAuthenticatedUser(req).id;
    const requests = await storage.getAdvertiserAccessRequests(advertiserId);
    res.json(requests);
  } catch (error) {
    console.error("Get advertiser access requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ответ на запрос доступа (для рекламодателей)
app.post('/api/access-requests/:id/respond', authenticateToken, requireRole(['advertiser']), async (req, res) => {
  try {
    const advertiserId = getAuthenticatedUser(req).id;
    const requestId = req.params.id;
    const { action, message } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    
    // Получаем запрос и проверяем права
    const requests = await storage.getOfferAccessRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    // Проверяем, что оффер принадлежит рекламодателю
    const offer = await storage.getOffer(request.offerId);
    if (!offer || offer.advertiserId !== advertiserId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    // Обновляем статус запроса
    const updatedRequest = await storage.updateOfferAccessRequest(requestId, {
      status,
      responseNote: message || null,
      updatedAt: new Date()
    });
    
    // Если одобрено, создаем связь партнер-оффер
    if (status === 'approved') {
      const existingPartnerOffers = await storage.getPartnerOffers(request.partnerId, request.offerId);
      if (existingPartnerOffers.length === 0) {
        await storage.createPartnerOffer({
          id: randomUUID(),
          partnerId: request.partnerId,
          offerId: request.offerId,
          isApproved: true,
          customPayout: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    res.json(updatedRequest);
  } catch (error) {
    console.error("Respond to access request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Массовые операции с запросами (для рекламодателей)
app.post('/api/access-requests/bulk-action', authenticateToken, requireRole(['advertiser']), async (req, res) => {
  try {
    const advertiserId = getAuthenticatedUser(req).id;
    const { requestIds, action, message } = req.body;
    
    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({ error: "Request IDs array is required" });
    }
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    const results = [];
    
    for (const requestId of requestIds) {
      try {
        // Получаем запрос и проверяем права
        const requests = await storage.getOfferAccessRequests();
        const request = requests.find(r => r.id === requestId);
        
        if (!request) {continue;}
        
        // Проверяем, что оффер принадлежит рекламодателю
        const offer = await storage.getOffer(request.offerId);
        if (!offer || offer.advertiserId !== advertiserId) {continue;}
        
        // Обновляем статус запроса
        const updatedRequest = await storage.updateOfferAccessRequest(requestId, {
          status,
          responseNote: message || null,
          updatedAt: new Date()
        });
        
        // Если одобрено, создаем связь партнер-оффер
        if (status === 'approved') {
          const existingPartnerOffers = await storage.getPartnerOffers(request.partnerId, request.offerId);
          if (existingPartnerOffers.length === 0) {
            await storage.createPartnerOffer({
              id: randomUUID(),
              partnerId: request.partnerId,
              offerId: request.offerId,
              isApproved: true,
              customPayout: null,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
        
        results.push(updatedRequest);
      } catch (_) {
        console.error(`Error processing request ${requestId}:`, error);
      }
    }
    
    res.json({ 
      success: true, 
      processed: results.length, 
      total: requestIds.length,
      results 
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Статистика запросов доступа (для всех ролей)
app.get('/api/access-requests/stats', authenticateToken, async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    let stats = {};
    
    if (user.role === 'advertiser') {
      const requests = await storage.getAdvertiserAccessRequests(user.id);
      stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        thisWeek: requests.filter(r => {
          const requestDate = new Date(r.requestedAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return requestDate > weekAgo;
        }).length
      };
    } else if (user.role === 'affiliate') {
      const requests = await storage.getOfferAccessRequests(user.id);
      stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        thisWeek: requests.filter(r => {
          const requestDate = new Date(r.createdAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return requestDate > weekAgo;
        }).length
      };
    } else if (user.role === 'super_admin') {
      const allRequests = await storage.getOfferAccessRequests();
      stats = {
        total: allRequests.length,
        pending: allRequests.filter(r => r.status === 'pending').length,
        approved: allRequests.filter(r => r.status === 'approved').length,
        rejected: allRequests.filter(r => r.status === 'rejected').length,
        thisWeek: allRequests.filter(r => {
          const requestDate = new Date(r.createdAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return requestDate > weekAgo;
        }).length
      };
    }
    
    res.json(stats);
  } catch (error) {
    console.error("Get access request stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

}