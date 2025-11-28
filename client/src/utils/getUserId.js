export default async function getUserId() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/getuser`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const data = await response.json();
    return data;
}