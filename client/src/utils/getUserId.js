const getBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default async function getUserId() {
  try {
    const response = await fetch(`${getBaseUrl()}/users/getuser`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) return { success: false, id: null };
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('getUserId error:', err);
    return { success: false, id: null };
  }
}