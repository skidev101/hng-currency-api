export interface CountryResponse {
  id: number;
  name: string;
  capital?: string | null;
  region?: string | null;
  population: number;
  currency_code?: string | null;
  exchange_rate?: number | null;
  estimated_gdp?: number | null;
  flag_url?: string | null;
  last_refreshed_at: string;
}

