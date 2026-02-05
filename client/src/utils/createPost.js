import getUserId from "./getUserId.js";

export default async function Upload(formData) {
    const data = await getUserId();
    const userID = data.id;
    formData.append("userID", userID);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/prompts/create`, {
        method: "POST",
        credentials: 'include',
        body: formData,
    });
    const result = await response.json();
    if(result.status !== 200){
        console.error("Error creating post:", result.message);
        return null;
    }
    return result.promptId;
}
