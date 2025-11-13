const checkAuthStatus = async (setIsLoggedIn) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/verify`, {
        method: 'GET',
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const res = await response.json()
    if (res.message==='Unauthorized' || res.message==='Invalid token') {
        setIsLoggedIn(false);
    } 
    else {
        setIsLoggedIn(true);
    }
};
export default checkAuthStatus;