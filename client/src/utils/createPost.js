import toast from 'react-hot-toast';

export default async function createPost(formData) {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const response = await fetch(`${baseUrl}/prompts/create`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || (result.status !== 200 && !result.success)) {
      toast.error(result.message || 'Error creating prompt post');
      return null;
    }

    return result.promptId;
  } catch (err) {
    console.error('Error creating post:', err);
    toast.error('Network error during prompt creation');
    return null;
  }
}
