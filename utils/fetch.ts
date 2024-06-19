export const fetchJSON= async (url: string): Promise<any> =>{
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data;
  }