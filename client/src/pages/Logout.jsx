import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogOut({ setIsLoggedIn }) {
    const navigate = useNavigate();
    const [statusMessage, setStatusMessage] = useState('Logging out...');

    const handleLogout = async () => {
        try {
            const response = await fetch(`http://localhost:3000/users/logout`, {
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
                navigate('/');
            }, 1500);
        }
    };

    useEffect(() => {
        handleLogout();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050A1A] text-white p-4">
            <div className="bg-gray-900 p-10 rounded-2xl shadow-xl w-96 border border-[#1C2233] text-center">
                <div className="mb-4">
                    <svg className="animate-spin h-8 w-8 text-[#4F7FFF] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <h2 className="text-xl font-medium text-gray-200">{statusMessage}</h2>
                <p className="text-sm text-gray-500 mt-2">Redirecting you to the homepage...</p>
            </div>
        </div>
    );
}
