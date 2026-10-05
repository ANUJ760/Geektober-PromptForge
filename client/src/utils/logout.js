export default async function logout(setStatusMessage, setIsLoggedIn, navigate) {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const response = await fetch(`${baseUrl}/users/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      if (setStatusMessage) setStatusMessage('Successfully logged out.');
      if (setIsLoggedIn) setIsLoggedIn(false);
    } else {
      if (setStatusMessage) setStatusMessage('Logout failed on server, session cleared locally.');
      if (setIsLoggedIn) setIsLoggedIn(false);
    }
  } catch (error) {
    console.warn('Logout network error:', error);
    if (setStatusMessage) setStatusMessage('Network error occurred. Session cleared locally.');
    if (setIsLoggedIn) setIsLoggedIn(false);
  } finally {
    setTimeout(() => {
      if (navigate) {
        navigate('/');
      } else {
        window.location.href = '/';
      }
    }, 1000);
  }
}