const checkAuthStatus = async (setIsLoggedIn) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const response = await fetch(`${baseUrl}/users/verify`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (setIsLoggedIn) setIsLoggedIn(false);
      return false;
    }

    const res = await response.json();
    const isValid = res.message === 'Token is valid' || res.success === true;
    if (setIsLoggedIn) setIsLoggedIn(isValid);
    return isValid;
  } catch (err) {
    console.warn('Session verification error:', err);
    if (setIsLoggedIn) setIsLoggedIn(false);
    return false;
  }
};

export default checkAuthStatus;