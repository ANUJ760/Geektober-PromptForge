export async function getPrompts() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/prompts/trending`, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await response.json();
    return data;
}

export async function getPromptById(id) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/prompts/${id}`, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await response.json();
    return data;
}

export async function getAllPrompts() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/prompts/all`, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await response.json();
    return data;
}

export async function getProfilePrompts() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/prompts/getProfilePrompts`, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await response.json();
    return data;
}
