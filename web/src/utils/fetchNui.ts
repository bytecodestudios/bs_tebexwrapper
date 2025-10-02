export async function fetchNui<T>(eventName: string, data?: unknown): Promise<T> {
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(data || {}),
  };

  const resourceName = (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName()
    : 'nui-frame-host'; 

  try {
    const resp = await fetch(`https://${resourceName}/${eventName}`, options);
    const responseText = await resp.text();
    return responseText ? JSON.parse(responseText) : ({} as T);
  } catch (e) {
    console.error(`[fetchNui] Failed to fetch event ${eventName}. Is the game running and the resource started?`, e);
    return {} as T;
  }
}