export const secureApi = {
  get: async (url: string) => {
    const token = localStorage.getItem('auth:token');
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },
};
