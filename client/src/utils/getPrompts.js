export async function getPrompts() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/prompts/trending`, {
        method: 'GET',
    });
    const data = await response.json();
    return data;
}

export async function getPromptById(id) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/prompts/${id}`, {
        method: 'GET',
    });
    const data = await response.json();
    return data;
}

export async function getAllPrompts() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/prompts/all`, {
        method: 'GET',
    });
    const data = await response.json();
    return data;
}