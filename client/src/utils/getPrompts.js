const getBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export async function getPrompts() {
  const response = await fetch(`${getBaseUrl()}/prompts/trending`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  return data;
}

export async function getPromptById(id) {
  const response = await fetch(`${getBaseUrl()}/prompts/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  return data;
}

export async function getAllPrompts(params = {}) {
  const { q, category, aiModel, pricing, sort, page = 1, limit = 9 } = params;
  const searchParams = new URLSearchParams();

  if (q && q.trim()) searchParams.append('q', q.trim());
  if (category && category !== 'All') searchParams.append('category', category);
  if (aiModel && aiModel !== 'All') searchParams.append('aiModel', aiModel);
  if (pricing && pricing !== 'all') searchParams.append('pricing', pricing);
  if (sort) searchParams.append('sort', sort);
  searchParams.append('page', page);
  searchParams.append('limit', limit);

  const url = `${getBaseUrl()}/prompts/all?${searchParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });
  const result = await response.json();

  // If server returns structured envelope { success, data, pagination }
  if (result && result.data) {
    return {
      prompts: result.data,
      pagination: result.pagination,
    };
  }

  // Fallback for array response
  return {
    prompts: Array.isArray(result) ? result : [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: Array.isArray(result) ? result.length : 0,
      limit,
    },
  };
}

export async function getProfilePrompts() {
  const response = await fetch(`${getBaseUrl()}/prompts/getProfilePrompts`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  return data;
}
