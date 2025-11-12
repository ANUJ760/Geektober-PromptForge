const checkAuthStatus = async (setIsLoggedIn) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/verify`, {
        method: 'GET',
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (response.ok) {
        setIsLoggedIn(true);
    } 
    else {
        setIsLoggedIn(false);
    }
};
export default checkAuthStatus;