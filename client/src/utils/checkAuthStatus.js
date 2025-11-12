const checkAuthStatus = async (setIsLoggedIn) => {
    const response = await fetch('http://localhost:3000/users/verify', {
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