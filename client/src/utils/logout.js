export default async function addUser(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/logout`, {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
        });
    const res = await response.json();
    window.location.href = '/';
}