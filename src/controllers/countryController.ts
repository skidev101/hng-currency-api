import { Request, Response } from "express";
import * as countryService from "../services/countryService";
import {
  summaryImageExists,
  getSummaryImagePath,
} from "../services/imageService.js";
import { CountryResponse } from "../types/index";
import { bigIntToNumber } from "../utils/helpers";

/**
 * POST /countries/refresh
 */
export const refreshCountries = async (req: Request, res: Response) => {
  try {
    const result = await countryService.refreshCountries();
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * GET /countries
 */
export const getAllCountries = async (req: Request, res: Response) => {
  try {
    const query = req.query as unknown;
    const countries = await countryService.getAllCountries(query);

    // Format response
    const formattedCountries: CountryResponse[] = countries.map((country: any) => ({
      id: country.id,
      name: country.name,
      capital: country.capital,
      region: country.region,
      population: bigIntToNumber(country.population),
      currency_code: country.currency_code,
      exchange_rate: Number(country.exchange_rate?.toFixed(2)),
      estimated_gdp: country.estimated_gdp,
      flag_url: country.flag_url,
      last_refreshed_at: country.last_refreshed_at.toISOString(),
    }));

    res.status(200).json(formattedCountries);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * GET /countries/:name
 */
export const getCountryByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const country = await countryService.getCountryByName(name as string);

    if (!country) {
      return res.status(404).json({
        error: "Country not found",
      });
    }

    // Format response
    const formattedCountry: CountryResponse = {
      id: country.id,
      name: country.name,
      capital: country.capital,
      region: country.region,
      population: bigIntToNumber(country.population),
      currency_code: country.currency_code,
      exchange_rate: country.exchange_rate,
      estimated_gdp: country.estimated_gdp,
      flag_url: country.flag_url,
      last_refreshed_at: country.last_refreshed_at.toISOString(),
    };

    res.status(200).json(formattedCountry);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * DELETE /countries/:name
 */
export const deleteCountryByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const country = await countryService.deleteCountryByName(name as string);

    if (!country) {
      return res.status(404).json({
        error: "Country not found",
      });
    }

    res.status(200).json({
      message: "Country deleted successfully",
      name: country.name,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * GET /status
 */
export const getStatus = async (req: Request, res: Response) => {
  try {
    const status = await countryService.getStatus();
    res.status(200).json(status);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * GET /countries/image
 */
export const getSummaryImage = async (req: Request, res: Response) => {
  try {
    if (!summaryImageExists()) {
      return res.status(404).json({
        error: "Summary image not found",
      });
    }

    const imagePath = getSummaryImagePath();
    res.sendFile(imagePath);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
