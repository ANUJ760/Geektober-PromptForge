export async function getPrompts() {
    const response = await fetch('http://localhost:3000/prompts/trending', {
        method: 'GET',
    });
    const data = await response.json();
    return data;
}

export async function getPromptById(id) {
    const response = await fetch(`http://localhost:3000/prompts/${id}`, {
        method: 'GET',
    });
    const data = await response.json();
    return data;
}

export async function getAllPrompts() {
    const response = await fetch(`http://localhost:3000/prompts/all`, {
        method: 'GET',
    });
    const data = await response.json();
    return data;
}