export default async function logout(setStatusMessage, setIsLoggedIn) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
             },
        });

        if (response.ok) {
            setStatusMessage('Successfully logged out.');
            setIsLoggedIn(false);
        } else {
            setStatusMessage('Logout failed on server, but session cleared locally.');
            setIsLoggedIn(false);
        }
    } catch (error) {
        setStatusMessage('Network error occurred. Logging out locally.');
        setIsLoggedIn(false);
    } finally {
        setTimeout(() => {
            window.location.href='/home'
        }, 1500);
    }
}