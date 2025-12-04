import getUserId from "./getUserId.js";

export default async function Upload(formData) {
    const data = await getUserId();
    const userID = data.id;
    formData.append("userID", userID);
    console.log("Uploading FormData:");
    for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/prompts/create`, {
        method: "POST",
        body: formData,
    });

    return await response.json();
}
