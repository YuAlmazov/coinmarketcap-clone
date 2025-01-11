// services/news.ts

// Определим интерфейс статьи, возвращаемой CryptoCompare News API
export interface CryptoNewsArticle {
    id: string;
    guid: string;
    published_on: number;
    imageurl: string;
    title: string;
    url: string;
    source: string;
    body: string;
    tags: string;
    categories: string;
    upvotes: string;
    downvotes: string;
    lang: string;
    source_info: {
      name: string;
      lang: string;
      img: string;
    };
  }
  
  interface CryptoCompareNewsResponse {
    Data: CryptoNewsArticle[];
  }
  
  export async function getLatestNews(): Promise<CryptoNewsArticle[]> {
    try {
      const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
  
      if (!res.ok) {
        throw new Error(`Failed to fetch news. Status: ${res.status}`);
      }
  
      // Типизируем ответ
      const data: CryptoCompareNewsResponse = await res.json();
  
      // Ожидается, что data.Data будет массивом статей
      return data.Data || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }