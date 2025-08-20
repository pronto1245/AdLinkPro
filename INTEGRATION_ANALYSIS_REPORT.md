# AdLinkPro Integration Analysis Report

Generated: 2025-08-20T20:42:14.210Z

## Executive Summary

- **Total Pages**: 91
- **Total Backend Routes**: 15
- **Total Components**: 0
- **Total Shared Schemas**: 5
- **Infrastructure Services**: 5
- **Problems Identified**: 306
- **Dead Modules**: 15

## Problems Table

| Category | Severity | Issue | Solution |
|----------|----------|--------|----------|
| integration | low | Page /EventTesting has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /LoginVariants has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /NotFound has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /SidebarDemo has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /Unauthorized has no backend connections | Add appropriate API calls or connect to backend services |
| integration | high | API call "/api/advertiser/access-requests" in page /advertiser/AccessRequests has no matching backend route | Implement backend route for /api/advertiser/access-requests or fix the API call |
| integration | high | API call "/api/offers/${data.offerId}/access-requests/${data.requestId}" in page /advertiser/AccessRequests has no matching backend route | Implement backend route for /api/offers/${data.offerId}/access-requests/${data.requestId} or fix the API call |
| integration | high | API call "/api/advertiser/access-requests" in page /advertiser/AdvertiserAccessRequests has no matching backend route | Implement backend route for /api/advertiser/access-requests or fix the API call |
| integration | high | API call "/api/advertiser/access-requests/${data.requestId}/respond" in page /advertiser/AdvertiserAccessRequests has no matching backend route | Implement backend route for /api/advertiser/access-requests/${data.requestId}/respond or fix the API call |
| integration | high | API call "/api/analytics/advertiser/statistics?${params}" in page /advertiser/AdvertiserAnalytics has no matching backend route | Implement backend route for /api/analytics/advertiser/statistics?${params} or fix the API call |
| integration | high | API call "/api/analytics/advertiser/offers" in page /advertiser/AdvertiserAnalytics has no matching backend route | Implement backend route for /api/analytics/advertiser/offers or fix the API call |
| integration | high | API call "/api/analytics/advertiser/partners" in page /advertiser/AdvertiserAnalytics has no matching backend route | Implement backend route for /api/analytics/advertiser/partners or fix the API call |
| integration | high | API call "/api/analytics/advertiser/statistics/export?${params}" in page /advertiser/AdvertiserAnalytics has no matching backend route | Implement backend route for /api/analytics/advertiser/statistics/export?${params} or fix the API call |
| integration | high | API call "/api/analytics/advertiser/statistics" in page /advertiser/AdvertiserAnalytics has no matching backend route | Implement backend route for /api/analytics/advertiser/statistics or fix the API call |
| integration | high | API call "/api/advertiser/dashboard" in page /advertiser/AdvertiserDashboard has no matching backend route | Implement backend route for /api/advertiser/dashboard or fix the API call |
| integration | high | API call "/api/advertiser/documentation" in page /advertiser/AdvertiserDocuments has no matching backend route | Implement backend route for /api/advertiser/documentation or fix the API call |
| integration | high | API call "/api/advertiser/documentation/${feedback.sectionId}/feedback" in page /advertiser/AdvertiserDocuments has no matching backend route | Implement backend route for /api/advertiser/documentation/${feedback.sectionId}/feedback or fix the API call |
| integration | high | API call "/api/advertiser/documentation/download-pdf" in page /advertiser/AdvertiserDocuments has no matching backend route | Implement backend route for /api/advertiser/documentation/download-pdf or fix the API call |
| integration | high | API call "/api/advertiser/stats" in page /advertiser/AdvertiserDocuments has no matching backend route | Implement backend route for /api/advertiser/stats or fix the API call |
| integration | high | API call "/api/advertiser/stats?from=2025-08-01&to=2025-08-06" in page /advertiser/AdvertiserDocuments has no matching backend route | Implement backend route for /api/advertiser/stats?from=2025-08-01&to=2025-08-06 or fix the API call |
| integration | high | API call "/api/advertiser/financial-overview" in page /advertiser/AdvertiserFinances has no matching backend route | Implement backend route for /api/advertiser/financial-overview or fix the API call |
| integration | high | API call "/api/advertiser/transactions" in page /advertiser/AdvertiserFinances has no matching backend route | Implement backend route for /api/advertiser/transactions or fix the API call |
| integration | high | API call "/api/notifications/${notificationId}/read" in page /advertiser/AdvertiserNotifications has no matching backend route | Implement backend route for /api/notifications/${notificationId}/read or fix the API call |
| integration | high | API call "/api/notifications/${notificationId}" in page /advertiser/AdvertiserNotifications has no matching backend route | Implement backend route for /api/notifications/${notificationId} or fix the API call |
| integration | high | API call "/api/notifications/mark-all-read" in page /advertiser/AdvertiserNotifications has no matching backend route | Implement backend route for /api/notifications/mark-all-read or fix the API call |
| integration | high | API call "/api/notifications" in page /advertiser/AdvertiserNotifications has no matching backend route | Implement backend route for /api/notifications or fix the API call |
| integration | high | API call "/api/advertiser/offers" in page /advertiser/AdvertiserOffers has no matching backend route | Implement backend route for /api/advertiser/offers or fix the API call |
| integration | high | API call "/api/advertiser/offers/${data.id}" in page /advertiser/AdvertiserOffers has no matching backend route | Implement backend route for /api/advertiser/offers/${data.id} or fix the API call |
| integration | high | API call "/api/advertiser/offers/${offerId}" in page /advertiser/AdvertiserOffers has no matching backend route | Implement backend route for /api/advertiser/offers/${offerId} or fix the API call |
| integration | high | API call "/api/advertiser/offers/${id}" in page /advertiser/AdvertiserOffers has no matching backend route | Implement backend route for /api/advertiser/offers/${id} or fix the API call |
| integration | high | API call "/api/advertiser/offers/bulk-update" in page /advertiser/AdvertiserOffers has no matching backend route | Implement backend route for /api/advertiser/offers/bulk-update or fix the API call |
| integration | high | API call "/api/advertiser/offers/reorder" in page /advertiser/AdvertiserOffers has no matching backend route | Implement backend route for /api/advertiser/offers/reorder or fix the API call |
| integration | high | API call "/api/advertiser/offers" in page /advertiser/AdvertiserOffers_SIMPLE has no matching backend route | Implement backend route for /api/advertiser/offers or fix the API call |
| integration | high | API call "/api/advertiser/partners/${partner.id}" in page /advertiser/AdvertiserPartners has no matching backend route | Implement backend route for /api/advertiser/partners/${partner.id} or fix the API call |
| integration | high | API call "/api/advertiser/partners" in page /advertiser/AdvertiserPartners has no matching backend route | Implement backend route for /api/advertiser/partners or fix the API call |
| integration | high | API call "/api/advertiser/partners/${partnerId}/status" in page /advertiser/AdvertiserPartners has no matching backend route | Implement backend route for /api/advertiser/partners/${partnerId}/status or fix the API call |
| integration | high | API call "/api/advertiser/partners/invite" in page /advertiser/AdvertiserPartners has no matching backend route | Implement backend route for /api/advertiser/partners/invite or fix the API call |
| integration | high | API call "/api/advertiser/partners/bulk" in page /advertiser/AdvertiserPartners has no matching backend route | Implement backend route for /api/advertiser/partners/bulk or fix the API call |
| integration | high | API call "/api/track/postback/test" in page /advertiser/AdvertiserPostbackSettings has no matching backend route | Implement backend route for /api/track/postback/test or fix the API call |
| integration | high | API call "/api/advertiser/postback/profiles" in page /advertiser/AdvertiserPostbackSettings has no matching backend route | Implement backend route for /api/advertiser/postback/profiles or fix the API call |
| integration | high | API call "/api/advertiser/postback/logs" in page /advertiser/AdvertiserPostbackSettings has no matching backend route | Implement backend route for /api/advertiser/postback/logs or fix the API call |
| integration | high | API call "/api/advertiser/offers" in page /advertiser/AdvertiserPostbackSettings has no matching backend route | Implement backend route for /api/advertiser/offers or fix the API call |
| integration | high | API call "/api/advertiser/partners" in page /advertiser/AdvertiserPostbackSettings has no matching backend route | Implement backend route for /api/advertiser/partners or fix the API call |
| integration | high | API call "/api/advertiser/postback/profiles/${id}" in page /advertiser/AdvertiserPostbackSettings has no matching backend route | Implement backend route for /api/advertiser/postback/profiles/${id} or fix the API call |
| integration | high | API call "/api/v1/conversions?clickid={clickid}&status={status}&revenue={revenue}&offer_id={offer_id}&partner_id={partner_id}" in page /advertiser/AdvertiserPostbackSettings has no matching backend route | Implement backend route for /api/v1/conversions?clickid={clickid}&status={status}&revenue={revenue}&offer_id={offer_id}&partner_id={partner_id} or fix the API call |
| integration | high | API call "/api/leads?clickid={" in page /advertiser/AdvertiserPostbackSettings has no matching backend route | Implement backend route for /api/leads?clickid={ or fix the API call |
| integration | high | API call "/api/auth/me" in page /advertiser/AdvertiserProfile has no matching backend route | Implement backend route for /api/auth/me or fix the API call |
| integration | high | API call "/api/advertiser/api-tokens" in page /advertiser/AdvertiserProfile has no matching backend route | Implement backend route for /api/advertiser/api-tokens or fix the API call |
| integration | high | API call "/api/advertiser/profile/webhook" in page /advertiser/AdvertiserProfile has no matching backend route | Implement backend route for /api/advertiser/profile/webhook or fix the API call |
| integration | high | API call "/api/advertiser/profile" in page /advertiser/AdvertiserProfile has no matching backend route | Implement backend route for /api/advertiser/profile or fix the API call |
| integration | high | API call "/api/advertiser/profile/change-password" in page /advertiser/AdvertiserProfile has no matching backend route | Implement backend route for /api/advertiser/profile/change-password or fix the API call |
| integration | high | API call "/api/advertiser/api-tokens/${tokenId}" in page /advertiser/AdvertiserProfile has no matching backend route | Implement backend route for /api/advertiser/api-tokens/${tokenId} or fix the API call |
| integration | high | API call "/api/advertiser/profile/notifications" in page /advertiser/AdvertiserProfile has no matching backend route | Implement backend route for /api/advertiser/profile/notifications or fix the API call |
| integration | high | API call "/api/advertiser/antifraud/dashboard" in page /advertiser/AntiFraud has no matching backend route | Implement backend route for /api/advertiser/antifraud/dashboard or fix the API call |
| integration | high | API call "/api/advertiser/antifraud/dashboard?range=${dateRange}" in page /advertiser/AntiFraud has no matching backend route | Implement backend route for /api/advertiser/antifraud/dashboard?range=${dateRange} or fix the API call |
| integration | high | API call "/api/advertiser/antifraud/events" in page /advertiser/AntiFraud has no matching backend route | Implement backend route for /api/advertiser/antifraud/events or fix the API call |
| integration | high | API call "/api/advertiser/antifraud/events?${params}" in page /advertiser/AntiFraud has no matching backend route | Implement backend route for /api/advertiser/antifraud/events?${params} or fix the API call |
| integration | high | API call "/api/advertiser/antifraud/settings" in page /advertiser/AntiFraud has no matching backend route | Implement backend route for /api/advertiser/antifraud/settings or fix the API call |
| integration | high | API call "/api/advertiser/antifraud/confirm-event" in page /advertiser/AntiFraud has no matching backend route | Implement backend route for /api/advertiser/antifraud/confirm-event or fix the API call |
| integration | high | API call "/api/advertiser/antifraud/block-partner" in page /advertiser/AntiFraud has no matching backend route | Implement backend route for /api/advertiser/antifraud/block-partner or fix the API call |
| integration | high | API call "/api/objects/upload" in page /advertiser/CreateOffer has no matching backend route | Implement backend route for /api/objects/upload or fix the API call |
| integration | high | API call "/api/advertiser/offers" in page /advertiser/CreateOffer has no matching backend route | Implement backend route for /api/advertiser/offers or fix the API call |
| integration | high | API call "/api/advertiser/tracking-domains" in page /advertiser/CreateOffer has no matching backend route | Implement backend route for /api/advertiser/tracking-domains or fix the API call |
| integration | high | API call "/api/advertiser/offers" in page /advertiser/EditOffer has no matching backend route | Implement backend route for /api/advertiser/offers or fix the API call |
| integration | high | API call "/api/advertiser/offers/${offerId}" in page /advertiser/EditOffer has no matching backend route | Implement backend route for /api/advertiser/offers/${offerId} or fix the API call |
| integration | high | API call "/api/advertiser/financial-overview?${params}" in page /advertiser/Finance has no matching backend route | Implement backend route for /api/advertiser/financial-overview?${params} or fix the API call |
| integration | high | API call "/api/advertiser/transactions?${params}" in page /advertiser/Finance has no matching backend route | Implement backend route for /api/advertiser/transactions?${params} or fix the API call |
| integration | high | API call "/api/advertiser/partners" in page /advertiser/Finance has no matching backend route | Implement backend route for /api/advertiser/partners or fix the API call |
| integration | high | API call "/api/advertiser/offers" in page /advertiser/Finance has no matching backend route | Implement backend route for /api/advertiser/offers or fix the API call |
| integration | high | API call "/api/advertiser/finance/payouts" in page /advertiser/Finance has no matching backend route | Implement backend route for /api/advertiser/finance/payouts or fix the API call |
| integration | high | API call "/api/advertiser/finance/transactions/${transactionId}/status" in page /advertiser/Finance has no matching backend route | Implement backend route for /api/advertiser/finance/transactions/${transactionId}/status or fix the API call |
| integration | high | API call "/api/advertiser/finance/export?${params}" in page /advertiser/Finance has no matching backend route | Implement backend route for /api/advertiser/finance/export?${params} or fix the API call |
| integration | high | API call "/api/advertiser/finance/transactions/${transactionId}/details" in page /advertiser/Finance has no matching backend route | Implement backend route for /api/advertiser/finance/transactions/${transactionId}/details or fix the API call |
| integration | high | API call "/api/advertiser/finance/summary" in page /advertiser/Finance has no matching backend route | Implement backend route for /api/advertiser/finance/summary or fix the API call |
| integration | high | API call "/api/advertiser/finance/transactions" in page /advertiser/Finance has no matching backend route | Implement backend route for /api/advertiser/finance/transactions or fix the API call |
| integration | high | API call "/api/advertiser/offers/${offerId}/status" in page /advertiser/MyOffers has no matching backend route | Implement backend route for /api/advertiser/offers/${offerId}/status or fix the API call |
| integration | high | API call "/api/advertiser/offers/${offer.id}" in page /advertiser/MyOffers has no matching backend route | Implement backend route for /api/advertiser/offers/${offer.id} or fix the API call |
| integration | high | API call "/api/advertiser/offers/${id}" in page /advertiser/MyOffers has no matching backend route | Implement backend route for /api/advertiser/offers/${id} or fix the API call |
| integration | high | API call "/api/advertiser/offers/${offerId}/partners" in page /advertiser/MyOffers has no matching backend route | Implement backend route for /api/advertiser/offers/${offerId}/partners or fix the API call |
| integration | high | API call "/api/advertiser/partner/${selectedPartner}/stats" in page /advertiser/MyOffers has no matching backend route | Implement backend route for /api/advertiser/partner/${selectedPartner}/stats or fix the API call |
| integration | high | API call "/api/advertiser/offers" in page /advertiser/MyOffers has no matching backend route | Implement backend route for /api/advertiser/offers or fix the API call |
| integration | high | API call "/api/advertiser/partner" in page /advertiser/MyOffers has no matching backend route | Implement backend route for /api/advertiser/partner or fix the API call |
| integration | high | API call "/api/advertiser/offers" in page /advertiser/MyOffersDragDrop has no matching backend route | Implement backend route for /api/advertiser/offers or fix the API call |
| integration | high | API call "/api/advertiser/offers/${payload.id}" in page /advertiser/MyOffersDragDrop has no matching backend route | Implement backend route for /api/advertiser/offers/${payload.id} or fix the API call |
| integration | high | API call "/api/advertiser/offers/${id}" in page /advertiser/MyOffersDragDrop has no matching backend route | Implement backend route for /api/advertiser/offers/${id} or fix the API call |
| integration | high | API call "/api/partner/offers/${offerId}/creatives/download" in page /advertiser/OfferDetails has no matching backend route | Implement backend route for /api/partner/offers/${offerId}/creatives/download or fix the API call |
| integration | high | API call "/api/offers/${offerId}/creatives" in page /advertiser/OfferDetails has no matching backend route | Implement backend route for /api/offers/${offerId}/creatives or fix the API call |
| integration | high | API call "/api/advertiser/offers" in page /advertiser/OfferDetails has no matching backend route | Implement backend route for /api/advertiser/offers or fix the API call |
| integration | low | Page /advertiser/OfferEditModal has no backend connections | Add appropriate API calls or connect to backend services |
| integration | high | API call "/api/advertiser/offers/${offer.id}" in page /advertiser/OfferManagement has no matching backend route | Implement backend route for /api/advertiser/offers/${offer.id} or fix the API call |
| integration | high | API call "/api/advertiser/offers" in page /advertiser/OfferManagement has no matching backend route | Implement backend route for /api/advertiser/offers or fix the API call |
| integration | high | API call "/api/advertiser/offers/${offerId}" in page /advertiser/OfferManagement has no matching backend route | Implement backend route for /api/advertiser/offers/${offerId} or fix the API call |
| integration | high | API call "/api/advertiser/offers/${offerId}/status" in page /advertiser/OfferManagement has no matching backend route | Implement backend route for /api/advertiser/offers/${offerId}/status or fix the API call |
| integration | high | API call "/api/advertiser/offers/bulk" in page /advertiser/OfferManagement has no matching backend route | Implement backend route for /api/advertiser/offers/bulk or fix the API call |
| integration | high | API call "/api/postback-profiles" in page /advertiser/PostbackProfiles has no matching backend route | Implement backend route for /api/postback-profiles or fix the API call |
| integration | high | API call "/api/postback/deliveries" in page /advertiser/PostbackProfiles has no matching backend route | Implement backend route for /api/postback/deliveries or fix the API call |
| integration | high | API call "/api/postback/deliveries${selectedDeliveryProfile" in page /advertiser/PostbackProfiles has no matching backend route | Implement backend route for /api/postback/deliveries${selectedDeliveryProfile or fix the API call |
| integration | high | API call "/api/postback-profiles/${id}" in page /advertiser/PostbackProfiles has no matching backend route | Implement backend route for /api/postback-profiles/${id} or fix the API call |
| integration | high | API call "/api/postback/profiles" in page /advertiser/Postbacks has no matching backend route | Implement backend route for /api/postback/profiles or fix the API call |
| integration | high | API call "/api/postback/deliveries" in page /advertiser/Postbacks has no matching backend route | Implement backend route for /api/postback/deliveries or fix the API call |
| integration | high | API call "/api/postback/profiles/${id}" in page /advertiser/Postbacks has no matching backend route | Implement backend route for /api/postback/profiles/${id} or fix the API call |
| integration | high | API call "/api/postback/profiles/${profileId}/test" in page /advertiser/Postbacks has no matching backend route | Implement backend route for /api/postback/profiles/${profileId}/test or fix the API call |
| integration | high | API call "/api/advertiser/received-offers" in page /advertiser/ReceivedOffers has no matching backend route | Implement backend route for /api/advertiser/received-offers or fix the API call |
| integration | high | API call "/api/advertiser/referral-stats" in page /advertiser/ReferralProgram has no matching backend route | Implement backend route for /api/advertiser/referral-stats or fix the API call |
| integration | high | API call "/api/advertiser/referral-program/toggle" in page /advertiser/ReferralProgram has no matching backend route | Implement backend route for /api/advertiser/referral-program/toggle or fix the API call |
| integration | high | API call "/api/referrals/stats" in page /advertiser/ReferralStats has no matching backend route | Implement backend route for /api/referrals/stats or fix the API call |
| integration | low | Page /advertiser/Reports has no backend connections | Add appropriate API calls or connect to backend services |
| integration | high | API call "/api/advertiser/team/members/${id}" in page /advertiser/TeamManagement has no matching backend route | Implement backend route for /api/advertiser/team/members/${id} or fix the API call |
| integration | high | API call "/api/dashboard/metrics" in page /advertiser/dashboard has no matching backend route | Implement backend route for /api/dashboard/metrics or fix the API call |
| integration | high | API call "/api/offers" in page /advertiser/dashboard has no matching backend route | Implement backend route for /api/offers or fix the API call |
| integration | high | API call "/api/transactions" in page /advertiser/dashboard has no matching backend route | Implement backend route for /api/transactions or fix the API call |
| integration | high | API call "/api/partner/access-requests" in page /affiliate/AccessRequestsManager has no matching backend route | Implement backend route for /api/partner/access-requests or fix the API call |
| integration | high | API call "/api/partner/offers/available" in page /affiliate/AccessRequestsManager has no matching backend route | Implement backend route for /api/partner/offers/available or fix the API call |
| integration | high | API call "/api/partner/offer-access-request" in page /affiliate/AccessRequestsManager has no matching backend route | Implement backend route for /api/partner/offer-access-request or fix the API call |
| integration | high | API call "/api/partner/offers" in page /affiliate/AffiliateOffers has no matching backend route | Implement backend route for /api/partner/offers or fix the API call |
| integration | high | API call "/api/affiliate/creatives/${creative.id}/download" in page /affiliate/CreativesAndTools has no matching backend route | Implement backend route for /api/affiliate/creatives/${creative.id}/download or fix the API call |
| integration | high | API call "/api/affiliate/creatives" in page /affiliate/CreativesAndTools has no matching backend route | Implement backend route for /api/affiliate/creatives or fix the API call |
| integration | high | API call "/api/affiliate/offers" in page /affiliate/CreativesAndTools has no matching backend route | Implement backend route for /api/affiliate/offers or fix the API call |
| integration | high | API call "/api/partner/finance/export?format=" in page /affiliate/Finances has no matching backend route | Implement backend route for /api/partner/finance/export?format= or fix the API call |
| integration | high | API call "/api/partner/finance/summary" in page /affiliate/Finances has no matching backend route | Implement backend route for /api/partner/finance/summary or fix the API call |
| integration | high | API call "/api/partner/finance/transactions" in page /affiliate/Finances has no matching backend route | Implement backend route for /api/partner/finance/transactions or fix the API call |
| integration | high | API call "/api/partner/finance/withdrawal" in page /affiliate/Finances has no matching backend route | Implement backend route for /api/partner/finance/withdrawal or fix the API call |
| integration | high | API call "/api/partner/offer-access-request" in page /affiliate/OfferDetails has no matching backend route | Implement backend route for /api/partner/offer-access-request or fix the API call |
| integration | high | API call "/api/partner/offers/${offerId}/creatives/download" in page /affiliate/OfferDetails has no matching backend route | Implement backend route for /api/partner/offers/${offerId}/creatives/download or fix the API call |
| integration | high | API call "/api/partner/offers/${offerId}" in page /affiliate/OfferDetails has no matching backend route | Implement backend route for /api/partner/offers/${offerId} or fix the API call |
| integration | high | API call "/api/partner/access-requests" in page /affiliate/OfferDetails has no matching backend route | Implement backend route for /api/partner/access-requests or fix the API call |
| integration | high | API call "/api/partner/offers" in page /affiliate/OfferDetails has no matching backend route | Implement backend route for /api/partner/offers or fix the API call |
| integration | high | API call "/api/partner/dashboard" in page /affiliate/PartnerDashboard has no matching backend route | Implement backend route for /api/partner/dashboard or fix the API call |
| integration | high | API call "/api/notifications" in page /affiliate/PartnerDashboard has no matching backend route | Implement backend route for /api/notifications or fix the API call |
| integration | high | API call "/api/live-analytics/partner/live-statistics?${params}" in page /affiliate/PartnerLiveAnalytics has no matching backend route | Implement backend route for /api/live-analytics/partner/live-statistics?${params} or fix the API call |
| integration | high | API call "/api/live-analytics/partner/live-statistics/export?${params}" in page /affiliate/PartnerLiveAnalytics has no matching backend route | Implement backend route for /api/live-analytics/partner/live-statistics/export?${params} or fix the API call |
| integration | high | API call "/api/live-analytics/partner/live-statistics" in page /affiliate/PartnerLiveAnalytics has no matching backend route | Implement backend route for /api/live-analytics/partner/live-statistics or fix the API call |
| integration | high | API call "/api/notifications/${notificationId}/read" in page /affiliate/PartnerNotifications has no matching backend route | Implement backend route for /api/notifications/${notificationId}/read or fix the API call |
| integration | high | API call "/api/notifications/${notificationId}" in page /affiliate/PartnerNotifications has no matching backend route | Implement backend route for /api/notifications/${notificationId} or fix the API call |
| integration | high | API call "/api/notifications" in page /affiliate/PartnerNotifications has no matching backend route | Implement backend route for /api/notifications or fix the API call |
| integration | high | API call "/api/partner/dashboard" in page /affiliate/PartnerNotifications has no matching backend route | Implement backend route for /api/partner/dashboard or fix the API call |
| integration | high | API call "/api/notifications/mark-all-read" in page /affiliate/PartnerNotifications has no matching backend route | Implement backend route for /api/notifications/mark-all-read or fix the API call |
| integration | high | API call "/api/partner/offers" in page /affiliate/PartnerOffers has no matching backend route | Implement backend route for /api/partner/offers or fix the API call |
| integration | high | API call "/api/partner/offer-access-request" in page /affiliate/PartnerOffers has no matching backend route | Implement backend route for /api/partner/offer-access-request or fix the API call |
| integration | high | API call "/api/partner/profile" in page /affiliate/PartnerProfile has no matching backend route | Implement backend route for /api/partner/profile or fix the API call |
| integration | high | API call "/api/auth/me" in page /affiliate/PartnerProfile has no matching backend route | Implement backend route for /api/auth/me or fix the API call |
| integration | high | API call "/api/partner/profile" in page /affiliate/PartnerSettings has no matching backend route | Implement backend route for /api/partner/profile or fix the API call |
| integration | high | API call "/api/auth/me" in page /affiliate/PartnerSettings has no matching backend route | Implement backend route for /api/auth/me or fix the API call |
| integration | high | API call "/api/partner/profile/change-password" in page /affiliate/PartnerSettings has no matching backend route | Implement backend route for /api/partner/profile/change-password or fix the API call |
| integration | high | API call "/api/affiliate/postbacks" in page /affiliate/PostbackManagement has no matching backend route | Implement backend route for /api/affiliate/postbacks or fix the API call |
| integration | high | API call "/api/affiliate/postbacks/logs" in page /affiliate/PostbackManagement has no matching backend route | Implement backend route for /api/affiliate/postbacks/logs or fix the API call |
| integration | high | API call "/api/affiliate/offers" in page /affiliate/PostbackManagement has no matching backend route | Implement backend route for /api/affiliate/offers or fix the API call |
| integration | high | API call "/api/affiliate/postbacks/${data.id}" in page /affiliate/PostbackManagement has no matching backend route | Implement backend route for /api/affiliate/postbacks/${data.id} or fix the API call |
| integration | high | API call "/api/affiliate/postbacks/${id}" in page /affiliate/PostbackManagement has no matching backend route | Implement backend route for /api/affiliate/postbacks/${id} or fix the API call |
| integration | high | API call "/api/affiliate/postbacks/${id}/test" in page /affiliate/PostbackManagement has no matching backend route | Implement backend route for /api/affiliate/postbacks/${id}/test or fix the API call |
| integration | high | API call "/api/postback/profiles" in page /affiliate/PostbackSettings has no matching backend route | Implement backend route for /api/postback/profiles or fix the API call |
| integration | high | API call "/api/postback/logs" in page /affiliate/PostbackSettings has no matching backend route | Implement backend route for /api/postback/logs or fix the API call |
| integration | high | API call "/api/track/postback/test" in page /affiliate/PostbackSettings has no matching backend route | Implement backend route for /api/track/postback/test or fix the API call |
| integration | high | API call "/api/v1/conversions?clickid={clickid}&status={status}&revenue={revenue}" in page /affiliate/PostbackSettings has no matching backend route | Implement backend route for /api/v1/conversions?clickid={clickid}&status={status}&revenue={revenue} or fix the API call |
| integration | high | API call "/api/postback/profiles/${profile.id}" in page /affiliate/Postbacks has no matching backend route | Implement backend route for /api/postback/profiles/${profile.id} or fix the API call |
| integration | high | API call "/api/v1/postback" in page /affiliate/Postbacks has no matching backend route | Implement backend route for /api/v1/postback or fix the API call |
| integration | high | API call "/api/postback/profiles" in page /affiliate/Postbacks has no matching backend route | Implement backend route for /api/postback/profiles or fix the API call |
| integration | high | API call "/api/postback/logs" in page /affiliate/Postbacks has no matching backend route | Implement backend route for /api/postback/logs or fix the API call |
| integration | high | API call "/api/postback/profiles/${id}" in page /affiliate/Postbacks has no matching backend route | Implement backend route for /api/postback/profiles/${id} or fix the API call |
| integration | high | API call "/api/postback/profiles/${profileId}" in page /affiliate/Postbacks has no matching backend route | Implement backend route for /api/postback/profiles/${profileId} or fix the API call |
| integration | high | API call "/api/postback/test/${profileId}" in page /affiliate/Postbacks has no matching backend route | Implement backend route for /api/postback/test/${profileId} or fix the API call |
| integration | high | API call "/api/postback/profiles" in page /affiliate/PostbacksNew has no matching backend route | Implement backend route for /api/postback/profiles or fix the API call |
| integration | high | API call "/api/postback/profiles/${id}" in page /affiliate/PostbacksNew has no matching backend route | Implement backend route for /api/postback/profiles/${id} or fix the API call |
| integration | high | API call "/api/partner/referral-stats" in page /affiliate/ReferralSystem has no matching backend route | Implement backend route for /api/partner/referral-stats or fix the API call |
| integration | high | API call "/api/referrals/stats" in page /affiliate/ReferralSystem has no matching backend route | Implement backend route for /api/referrals/stats or fix the API call |
| integration | high | API call "/api/partner/referral-stats" in page /affiliate/ReferralSystemFixed has no matching backend route | Implement backend route for /api/partner/referral-stats or fix the API call |
| integration | high | API call "/api/partner/analytics?${params}" in page /affiliate/Statistics has no matching backend route | Implement backend route for /api/partner/analytics?${params} or fix the API call |
| integration | high | API call "/api/partner/offers" in page /affiliate/Statistics has no matching backend route | Implement backend route for /api/partner/offers or fix the API call |
| integration | high | API call "/api/partner/analytics" in page /affiliate/Statistics has no matching backend route | Implement backend route for /api/partner/analytics or fix the API call |
| integration | high | API call "/api/affiliate/team" in page /affiliate/TeamManagement has no matching backend route | Implement backend route for /api/affiliate/team or fix the API call |
| integration | high | API call "/api/affiliate/team/${id}" in page /affiliate/TeamManagement has no matching backend route | Implement backend route for /api/affiliate/team/${id} or fix the API call |
| integration | high | API call "/api/affiliate/dashboard" in page /affiliate/dashboard has no matching backend route | Implement backend route for /api/affiliate/dashboard or fix the API call |
| integration | low | Page /auth/ForgotPassword has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /auth/RegisterAdvertiser has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /auth/RegisterPartner has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /auth/ResetPassword has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /auth/login/index has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /auth/logout has no backend connections | Add appropriate API calls or connect to backend services |
| integration | high | API call "/api/owner/metrics" in page /owner/OwnerDashboard has no matching backend route | Implement backend route for /api/owner/metrics or fix the API call |
| integration | low | Page /owner/Settings has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /owner/Users has no backend connections | Add appropriate API calls or connect to backend services |
| integration | high | API call "/api/partner/access-requests" in page /partner/AccessRequests has no matching backend route | Implement backend route for /api/partner/access-requests or fix the API call |
| integration | high | API call "/api/partner/access-requests/${requestId}/cancel" in page /partner/AccessRequests has no matching backend route | Implement backend route for /api/partner/access-requests/${requestId}/cancel or fix the API call |
| integration | low | Page /partner/Offers has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /partner/PartnerDashboard has no backend connections | Add appropriate API calls or connect to backend services |
| integration | high | API call "/api/partner/offers" in page /partner/PartnerOffers has no matching backend route | Implement backend route for /api/partner/offers or fix the API call |
| integration | low | Page /partner/PartnerProfile has no backend connections | Add appropriate API calls or connect to backend services |
| integration | low | Page /partner/SomePage has no backend connections | Add appropriate API calls or connect to backend services |
| integration | high | API call "/api/staff/metrics" in page /staff/StaffDashboard has no matching backend route | Implement backend route for /api/staff/metrics or fix the API call |
| integration | high | API call "/api/staff/tickets" in page /staff/StaffDashboard has no matching backend route | Implement backend route for /api/staff/tickets or fix the API call |
| integration | high | API call "/api/partner/offers/${offerId}/creatives/download" in page /super-admin/OfferDetailsRoleAware has no matching backend route | Implement backend route for /api/partner/offers/${offerId}/creatives/download or fix the API call |
| integration | high | API call "/api/offers/${offerId}/creatives" in page /super-admin/OfferDetailsRoleAware has no matching backend route | Implement backend route for /api/offers/${offerId}/creatives or fix the API call |
| integration | high | API call "/api/super-admin/offers" in page /super-admin/OfferDetailsRoleAware has no matching backend route | Implement backend route for /api/super-admin/offers or fix the API call |
| integration | high | API call "/api/analytics-enhanced/data?${params}" in page /super-admin/analytics-new has no matching backend route | Implement backend route for /api/analytics-enhanced/data?${params} or fix the API call |
| integration | high | API call "/api/analytics-enhanced/export" in page /super-admin/analytics-new has no matching backend route | Implement backend route for /api/analytics-enhanced/export or fix the API call |
| integration | high | API call "/api/analytics-enhanced/data" in page /super-admin/analytics-new has no matching backend route | Implement backend route for /api/analytics-enhanced/data or fix the API call |
| integration | high | API call "/api/admin/analytics" in page /super-admin/analytics-new has no matching backend route | Implement backend route for /api/admin/analytics or fix the API call |
| integration | low | Page /super-admin/analytics has no backend connections | Add appropriate API calls or connect to backend services |
| integration | high | API call "/api/admin/audit-logs?${params.toString()}" in page /super-admin/audit-logs has no matching backend route | Implement backend route for /api/admin/audit-logs?${params.toString()} or fix the API call |
| integration | high | API call "/api/admin/users" in page /super-admin/audit-logs has no matching backend route | Implement backend route for /api/admin/users or fix the API call |
| integration | high | API call "/api/admin/audit-logs" in page /super-admin/audit-logs has no matching backend route | Implement backend route for /api/admin/audit-logs or fix the API call |
| integration | high | API call "/api/admin/audit-logs?${params.toString(" in page /super-admin/audit-logs has no matching backend route | Implement backend route for /api/admin/audit-logs?${params.toString( or fix the API call |
| integration | high | API call "/api/admin/blacklist?${params.toString()}" in page /super-admin/blacklist-management has no matching backend route | Implement backend route for /api/admin/blacklist?${params.toString()} or fix the API call |
| integration | high | API call "/api/admin/blacklist" in page /super-admin/blacklist-management has no matching backend route | Implement backend route for /api/admin/blacklist or fix the API call |
| integration | high | API call "/api/admin/blacklist?${params.toString(" in page /super-admin/blacklist-management has no matching backend route | Implement backend route for /api/admin/blacklist?${params.toString( or fix the API call |
| integration | high | API call "/api/admin/blacklist/${id}" in page /super-admin/blacklist-management has no matching backend route | Implement backend route for /api/admin/blacklist/${id} or fix the API call |
| integration | high | API call "/api/admin/metrics" in page /super-admin/dashboard has no matching backend route | Implement backend route for /api/admin/metrics or fix the API call |
| integration | high | API call "/api/admin/financial-metrics/${dateFilter}" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/financial-metrics/${dateFilter} or fix the API call |
| integration | high | API call "/api/admin/finances" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/finances or fix the API call |
| integration | high | API call "/api/admin/payout-requests" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/payout-requests or fix the API call |
| integration | high | API call "/api/admin/deposits" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/deposits or fix the API call |
| integration | high | API call "/api/admin/commission-data" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/commission-data or fix the API call |
| integration | high | API call "/api/admin/financial-chart/${dateFilter}" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/financial-chart/${dateFilter} or fix the API call |
| integration | high | API call "/api/admin/crypto-portfolio" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/crypto-portfolio or fix the API call |
| integration | high | API call "/api/admin/crypto-wallets" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/crypto-wallets or fix the API call |
| integration | high | API call "/api/admin/transactions/${transactionId}" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/transactions/${transactionId} or fix the API call |
| integration | high | API call "/api/admin/payouts/${payoutId}/${action}" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/payouts/${payoutId}/${action} or fix the API call |
| integration | high | API call "/api/admin/invoices" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/invoices or fix the API call |
| integration | high | API call "/api/admin/crypto-deposit" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/crypto-deposit or fix the API call |
| integration | high | API call "/api/admin/crypto-withdraw" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/crypto-withdraw or fix the API call |
| integration | high | API call "/api/admin/financial-metrics" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/financial-metrics or fix the API call |
| integration | high | API call "/api/admin/financial-chart" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/financial-chart or fix the API call |
| integration | high | API call "/api/admin/financial" in page /super-admin/finances has no matching backend route | Implement backend route for /api/admin/financial or fix the API call |
| integration | high | API call "/api/admin/fraud-alerts" in page /super-admin/fraud-alerts has no matching backend route | Implement backend route for /api/admin/fraud-alerts or fix the API call |
| integration | high | API call "/api/admin/fraud-metrics" in page /super-admin/fraud-alerts has no matching backend route | Implement backend route for /api/admin/fraud-metrics or fix the API call |
| integration | high | API call "/api/admin/fraud-alerts/${alertId}" in page /super-admin/fraud-alerts has no matching backend route | Implement backend route for /api/admin/fraud-alerts/${alertId} or fix the API call |
| integration | high | API call "/api/admin/offers" in page /super-admin/offer-details has no matching backend route | Implement backend route for /api/admin/offers or fix the API call |
| integration | high | API call "/api/admin/offer-stats" in page /super-admin/offer-details has no matching backend route | Implement backend route for /api/admin/offer-stats or fix the API call |
| integration | high | API call "/api/admin/offers/${offer.id}" in page /super-admin/offer-details has no matching backend route | Implement backend route for /api/admin/offers/${offer.id} or fix the API call |
| integration | high | API call "/api/admin/offer-stats/${offer.id}" in page /super-admin/offer-details has no matching backend route | Implement backend route for /api/admin/offer-stats/${offer.id} or fix the API call |
| integration | high | API call "/api/admin/offers" in page /super-admin/offers-management has no matching backend route | Implement backend route for /api/admin/offers or fix the API call |
| integration | high | API call "/api/admin/offer-logs" in page /super-admin/offers-management has no matching backend route | Implement backend route for /api/admin/offer-logs or fix the API call |
| integration | high | API call "/api/admin/offer-stats" in page /super-admin/offers-management has no matching backend route | Implement backend route for /api/admin/offer-stats or fix the API call |
| integration | high | API call "/api/admin/offers/${offerId}/moderate" in page /super-admin/offers-management has no matching backend route | Implement backend route for /api/admin/offers/${offerId}/moderate or fix the API call |
| integration | high | API call "/api/admin/offers/bulk-activate" in page /super-admin/offers-management has no matching backend route | Implement backend route for /api/admin/offers/bulk-activate or fix the API call |
| integration | high | API call "/api/admin/offers/bulk-pause" in page /super-admin/offers-management has no matching backend route | Implement backend route for /api/admin/offers/bulk-pause or fix the API call |
| integration | high | API call "/api/admin/offers/bulk-delete" in page /super-admin/offers-management has no matching backend route | Implement backend route for /api/admin/offers/bulk-delete or fix the API call |
| integration | high | API call "/api/admin/offers/${offerData.id}" in page /super-admin/offers-management has no matching backend route | Implement backend route for /api/admin/offers/${offerData.id} or fix the API call |
| integration | high | API call "/api/admin/offers/${offerId}" in page /super-admin/offers-management has no matching backend route | Implement backend route for /api/admin/offers/${offerId} or fix the API call |
| integration | high | API call "/api/admin/offers/import" in page /super-admin/offers-management has no matching backend route | Implement backend route for /api/admin/offers/import or fix the API call |
| integration | low | Page /super-admin/offers has no backend connections | Add appropriate API calls or connect to backend services |
| integration | high | API call "/api/admin/global-postbacks" in page /super-admin/postbacks-management has no matching backend route | Implement backend route for /api/admin/global-postbacks or fix the API call |
| integration | high | API call "/api/admin/postback-logs" in page /super-admin/postbacks-management has no matching backend route | Implement backend route for /api/admin/postback-logs or fix the API call |
| integration | high | API call "/api/admin/global-postbacks/${id}" in page /super-admin/postbacks-management has no matching backend route | Implement backend route for /api/admin/global-postbacks/${id} or fix the API call |
| integration | high | API call "/api/admin/global-postbacks/${id}/test" in page /super-admin/postbacks-management has no matching backend route | Implement backend route for /api/admin/global-postbacks/${id}/test or fix the API call |
| integration | high | API call "/api/admin/postback-templates?${params}" in page /super-admin/postbacks has no matching backend route | Implement backend route for /api/admin/postback-templates?${params} or fix the API call |
| integration | high | API call "/api/admin/postback-logs?${params}" in page /super-admin/postbacks has no matching backend route | Implement backend route for /api/admin/postback-logs?${params} or fix the API call |
| integration | high | API call "/api/admin/offers" in page /super-admin/postbacks has no matching backend route | Implement backend route for /api/admin/offers or fix the API call |
| integration | high | API call "/api/admin/postback-templates" in page /super-admin/postbacks has no matching backend route | Implement backend route for /api/admin/postback-templates or fix the API call |
| integration | high | API call "/api/admin/postback-logs" in page /super-admin/postbacks has no matching backend route | Implement backend route for /api/admin/postback-logs or fix the API call |
| integration | high | API call "/api/admin/postback-templates/${id}" in page /super-admin/postbacks has no matching backend route | Implement backend route for /api/admin/postback-templates/${id} or fix the API call |
| integration | high | API call "/api/admin/postback-logs/${logId}/retry" in page /super-admin/postbacks has no matching backend route | Implement backend route for /api/admin/postback-logs/${logId}/retry or fix the API call |
| integration | high | API call "/api/admin/roles?${params.toString()}" in page /super-admin/roles-management has no matching backend route | Implement backend route for /api/admin/roles?${params.toString()} or fix the API call |
| integration | high | API call "/api/admin/users?role=advertiser" in page /super-admin/roles-management has no matching backend route | Implement backend route for /api/admin/users?role=advertiser or fix the API call |
| integration | high | API call "/api/admin/roles" in page /super-admin/roles-management has no matching backend route | Implement backend route for /api/admin/roles or fix the API call |
| integration | high | API call "/api/admin/roles?${params.toString(" in page /super-admin/roles-management has no matching backend route | Implement backend route for /api/admin/roles?${params.toString( or fix the API call |
| integration | high | API call "/api/admin/users" in page /super-admin/roles-management has no matching backend route | Implement backend route for /api/admin/users or fix the API call |
| integration | high | API call "/api/admin/roles/${roleId}" in page /super-admin/roles-management has no matching backend route | Implement backend route for /api/admin/roles/${roleId} or fix the API call |
| integration | high | API call "/api/admin/support/tickets" in page /super-admin/support has no matching backend route | Implement backend route for /api/admin/support/tickets or fix the API call |
| integration | high | API call "/api/admin/system-settings" in page /super-admin/system-settings has no matching backend route | Implement backend route for /api/admin/system-settings or fix the API call |
| integration | high | API call "/api/admin/system-settings/${id}" in page /super-admin/system-settings has no matching backend route | Implement backend route for /api/admin/system-settings/${id} or fix the API call |
| integration | high | API call "/api/admin/analytics/users?${params.toString()}" in page /super-admin/user-analytics has no matching backend route | Implement backend route for /api/admin/analytics/users?${params.toString()} or fix the API call |
| integration | high | API call "/api/admin/analytics/fraud?period=${period}" in page /super-admin/user-analytics has no matching backend route | Implement backend route for /api/admin/analytics/fraud?period=${period} or fix the API call |
| integration | high | API call "/api/admin/analytics/users" in page /super-admin/user-analytics has no matching backend route | Implement backend route for /api/admin/analytics/users or fix the API call |
| integration | high | API call "/api/admin/analytics/users?${params.toString(" in page /super-admin/user-analytics has no matching backend route | Implement backend route for /api/admin/analytics/users?${params.toString( or fix the API call |
| integration | high | API call "/api/admin/analytics/fraud" in page /super-admin/user-analytics has no matching backend route | Implement backend route for /api/admin/analytics/fraud or fix the API call |
| integration | high | API call "/api/admin/analytics/export?format=${format}&period=${period}&role=${roleFilter}" in page /super-admin/user-analytics has no matching backend route | Implement backend route for /api/admin/analytics/export?format=${format}&period=${period}&role=${roleFilter} or fix the API call |
| integration | high | API call "/api/admin/users?${params.toString()}" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users?${params.toString()} or fix the API call |
| integration | high | API call "/api/admin/users" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users or fix the API call |
| integration | high | API call "/api/admin/users?${params.toString(" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users?${params.toString( or fix the API call |
| integration | high | API call "/api/admin/users/${userId}/block" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users/${userId}/block or fix the API call |
| integration | high | API call "/api/admin/users/${userId}/unblock" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users/${userId}/unblock or fix the API call |
| integration | high | API call "/api/admin/users/${userId}/force-logout" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users/${userId}/force-logout or fix the API call |
| integration | high | API call "/api/admin/users/${userId}/reset-password" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users/${userId}/reset-password or fix the API call |
| integration | high | API call "/api/admin/users/${userId}" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users/${userId} or fix the API call |
| integration | high | API call "/api/admin/users/bulk" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users/bulk or fix the API call |
| integration | high | API call "/api/admin/users/bulk-block" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users/bulk-block or fix the API call |
| integration | high | API call "/api/admin/users/bulk-unblock" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users/bulk-unblock or fix the API call |
| integration | high | API call "/api/admin/users/bulk-delete" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users/bulk-delete or fix the API call |
| integration | high | API call "/api/admin/users/export?${params.toString(" in page /super-admin/users-management-old has no matching backend route | Implement backend route for /api/admin/users/export?${params.toString( or fix the API call |
| integration | low | Page /super-admin/users-management has no backend connections | Add appropriate API calls or connect to backend services |
| integration | high | API call "/api/admin/users" in page /super-admin/users has no matching backend route | Implement backend route for /api/admin/users or fix the API call |
| integration | high | API call "/api/admin/users/${userId}" in page /super-admin/users has no matching backend route | Implement backend route for /api/admin/users/${userId} or fix the API call |
| infrastructure | medium | websocket service is underutilized in pages | Integrate websocket service into more pages where appropriate |
| infrastructure | medium | websocket service is underutilized in components | Integrate websocket service into UI components where needed |
| infrastructure | medium | notifications service is underutilized in pages | Integrate notifications service into more pages where appropriate |
| infrastructure | medium | notifications service is underutilized in components | Integrate notifications service into UI components where needed |
| infrastructure | medium | themes service is underutilized in pages | Integrate themes service into more pages where appropriate |
| infrastructure | medium | themes service is underutilized in components | Integrate themes service into UI components where needed |
| infrastructure | medium | i18n service is underutilized in components | Integrate i18n service into UI components where needed |
| infrastructure | medium | auth service is underutilized in components | Integrate auth service into UI components where needed |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/team-routes.ts:GET /api/advertiser/team/members | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/team-routes.ts:POST /api/advertiser/team/members | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/team-routes.ts:POST /api/advertiser/team/invite | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/team-routes.ts:GET /api/advertiser/team/activity-logs | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/team-routes.ts:GET /api/advertiser/team/export | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/routes/telegram.ts:POST /api/telegram/webhook | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/routes/telegram.ts:POST /api/telegram/test | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/routes/telegram.ts:PATCH /api/telegram/link | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/routes/telegram.ts:DELETE /api/telegram/unlink/:userId | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:POST /api/access-requests | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:GET /api/access-requests/partner | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:GET /api/access-requests/advertiser | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:POST /api/access-requests/:id/respond | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:POST /api/access-requests/bulk-action | Review if route is needed or add frontend integration: Route not called from frontend |
| cleanup | low | Dead module: /home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:GET /api/access-requests/stats | Review if route is needed or add frontend integration: Route not called from frontend |

## Dead Modules

- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/team-routes.ts:GET /api/advertiser/team/members` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/team-routes.ts:POST /api/advertiser/team/members` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/team-routes.ts:POST /api/advertiser/team/invite` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/team-routes.ts:GET /api/advertiser/team/activity-logs` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/team-routes.ts:GET /api/advertiser/team/export` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/routes/telegram.ts:POST /api/telegram/webhook` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/routes/telegram.ts:POST /api/telegram/test` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/routes/telegram.ts:PATCH /api/telegram/link` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/routes/telegram.ts:DELETE /api/telegram/unlink/:userId` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:POST /api/access-requests` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:GET /api/access-requests/partner` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:GET /api/access-requests/advertiser` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:POST /api/access-requests/:id/respond` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:POST /api/access-requests/bulk-action` - Route not called from frontend *(Review if route is needed or add frontend integration)*
- **route**: `/home/runner/work/AdLinkPro/AdLinkPro/server/api/access-requests.ts:GET /api/access-requests/stats` - Route not called from frontend *(Review if route is needed or add frontend integration)*

## Recommendations

### HIGH: Address 283 integration integration issues
- **Category**: integration
- **Impact**: Improves system reliability and maintainability

### HIGH: Address 8 infrastructure integration issues
- **Category**: infrastructure
- **Impact**: Improves system reliability and maintainability

### HIGH: Address 15 cleanup integration issues
- **Category**: cleanup
- **Impact**: Improves system reliability and maintainability

### MEDIUM: Improve websocket service integration
- **Category**: infrastructure
- **Impact**: Enhances user experience and system consistency

### MEDIUM: Improve notifications service integration
- **Category**: infrastructure
- **Impact**: Enhances user experience and system consistency

### MEDIUM: Improve themes service integration
- **Category**: infrastructure
- **Impact**: Enhances user experience and system consistency

### LOW: Remove 15 dead modules
- **Category**: cleanup
- **Impact**: Reduces codebase complexity and maintenance burden


## Next Steps

1. **High Priority**: Address critical integration issues first
2. **Medium Priority**: Improve infrastructure service integration
3. **Low Priority**: Clean up dead modules and improve documentation
4. **Ongoing**: Set up automated integration testing

---
*Report generated by AdLinkPro Advanced Integration Audit Tool*
