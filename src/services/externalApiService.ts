import axios, { AxiosError } from "axios";

export const fetchCountries = async () => {
  const countriesApiUrl = process.env.COUNTRIES_API_URL;
  try {
    const response = await axios.get(countriesApiUrl!);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.code === "ECONNABORTED") {
      throw new Error("Could not fetch data from Countries API (timeout)");
    }
  }
};

export const fetchExchangeRates = async () => {
  const exchangeRateApi = process.env.EXCHANGE_RATES_API_URL;
  try {
    const response = await axios.get(exchangeRateApi!);

    if (response.status !== 200 || response.data.result !== "success") {
      throw new Error(`Exchange rates API returned status ${response.status}`);
    }

    return response.data.rates;
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.code === "ECONNABORTED") {
      throw new Error("Could not fetch data from Exchange Rates API (timeout)");
    }
  }
};
