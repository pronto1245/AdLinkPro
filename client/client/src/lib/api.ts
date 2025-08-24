import { fetchDashboard } from '@/services/dashboard';
import { getUsers } from '@/services/users';
import { getOffers } from '@/services/offers';
import { login, getMe } from '@/services/auth';

export const api = {
  fetchDashboard,
  getUsers,
  getOffers,
  login,
  getMe,
};
