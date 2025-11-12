export default async function handleLogin(event, setIsLoggedIn) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
        setIsLoggedIn(true);
        window.location.href='/home';
    } else {
        const message = 'Login failed. Please check your credentials.';
        alert(message);
    }
}