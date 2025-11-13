export default async function handleSignup(event, setIsLoggedIn) {
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
            body: JSON.stringify({ username, email, password  }),
        });

        if (response.ok) {
            setIsLoggedIn(true);
            window.location.href='/home'; 
        }
    } catch (error) {
        console.error("Network error during signup:", error);
    }
}