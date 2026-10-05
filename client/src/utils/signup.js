import toast from 'react-hot-toast';

export default async function handleSignup(event, setIsLoggedIn, navigate) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');
  const username = formData.get('username');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  try {
    const response = await fetch(`${baseUrl}/users/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'ok') {
      setIsLoggedIn(true);
      toast.success('Account created! Welcome to PromptForge.');
      if (navigate) {
        navigate('/');
      } else {
        window.location.href = '/';
      }
      return true;
    } else {
      toast.error(data.message || 'Signup failed. Please try again.');
      return false;
    }
  } catch (error) {
    console.error('Network error during signup:', error);
    toast.error('Network error. Please check your connection.');
    return false;
  }
}