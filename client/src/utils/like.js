const getBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// shouldLike is the desired final state; the server derives the user identity from the session cookie
export async function updateLike(promptId, shouldLike) {
  try {
    const endpoint = shouldLike ? 'addlike' : 'removelike';

    const response = await fetch(`${getBaseUrl()}/users/${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ promptId }),
    });

    return await response.json();
  } catch (err) {
    console.error('Error updating like:', err);
    return { success: false, error: err.message };
  }
}

export async function getLikeList() {
  try {
    const response = await fetch(`${getBaseUrl()}/users/likelist`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return [];
    const res = await response.json();
    return Array.isArray(res?.likedPrompts) ? res.likedPrompts : [];
  } catch (err) {
    console.error('Error fetching like list:', err);
    return [];
  }
}