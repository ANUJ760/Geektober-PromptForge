export default async function handleSignup(event, navigate, setIsLoggedIn, setError) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const username = formData.get('username');

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/signup`, {
            method: 'POST',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, username }),
        });

        if (response.ok) {
            setIsLoggedIn(true);
            navigate('/home'); 
        }
    } catch (error) {
        console.error("Network error during signup:", error);
    }
}