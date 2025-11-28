import getUserId from './getUserId';

export async function updateLike(isLiked, promptId) {
    const data = await getUserId();
    const userId = data.id;
    if(!isLiked) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/addlike`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ promptId, userId }),
        })
        const res = await response.json();
        return res;
    }
    else {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/removelike`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ promptId, userId }),
        })
        const res = await response.json();
        return res;
    }
}

export async function getLikeList() {
    const data = await getUserId();
    const userId = data.id;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/likelist`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    });
    const res = await response.json();
    return res.likedPrompts;
}