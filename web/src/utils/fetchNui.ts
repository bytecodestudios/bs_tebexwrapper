/**
 * A simplified function to send a message to the NUI.
 * It will be intercepted by our mock in `main.tsx` when in a browser.
 */
export async function fetchNui<T>(eventName: string, data?: unknown): Promise<T> {
  const options = {
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data),
  };

  // This will be 'undefined' in a browser, which is fine.
  // The mock in main.tsx will use a placeholder resource name.
  const resourceName = (window as any).GetParentResourceName ? (window as any).GetParentResourceName() : 'nui-frame-host';

  const resp = await fetch(`https://${resourceName}/${eventName}`, options);
  
  // It's good practice to check if the response body is empty
  const responseText = await resp.text();
  return responseText ? JSON.parse(responseText) : ({} as T);
}
