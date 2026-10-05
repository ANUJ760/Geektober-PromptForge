import toast from 'react-hot-toast';

export default async function handleLogin(event, setIsLoggedIn, navigate) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  try {
    const response = await fetch(`${baseUrl}/users/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'ok') {
      setIsLoggedIn(true);
      toast.success('Welcome back to PromptForge!');
      if (navigate) {
        navigate('/');
      } else {
        window.location.href = '/';
      }
      return true;
    } else {
      toast.error(data.message || 'Invalid email or password');
      return false;
    }
  } catch (err) {
    console.error('Login network error:', err);
    toast.error('Network error. Please check your connection.');
    return false;
  }
}