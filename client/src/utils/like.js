import getUserId from './getUserId';

const getBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export async function updateLike(isLiked, promptId) {
  try {
    const userData = await getUserId();
    const userId = userData?.id;
    const endpoint = isLiked ? 'removelike' : 'addlike';

    const response = await fetch(`${getBaseUrl()}/users/${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ promptId, userId }),
    });

    return await response.json();
  } catch (err) {
    console.error('Error updating like:', err);
    return { success: false, error: err.message };
  }
}

export async function getLikeList() {
  try {
    const userData = await getUserId();
    const userId = userData?.id;

    const response = await fetch(`${getBaseUrl()}/users/likelist`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) return [];
    const res = await response.json();
    return Array.isArray(res?.likedPrompts) ? res.likedPrompts : [];
  } catch (err) {
    console.error('Error fetching like list:', err);
    return [];
  }
}