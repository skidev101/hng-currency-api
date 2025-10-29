import pLimit from "p-limit";
import prisma from "../config/prisma";
import { calculateEstimatedGdp } from "../utils/helpers";
import { fetchCountries, fetchExchangeRates } from "./externalApiService";
import { generateImageSummary } from "./imageService";
import { AxiosError } from "axios";

export const refreshCountries = async () => {
  const timestamp = new Date();
  try {
    const [countries, exchangeRates] = await Promise.all([
      fetchCountries(),
      fetchExchangeRates(),
    ]);

    const limit = pLimit(10); // adjust concurrency as needed
    let processedCount = 0;

    const upserts = countries.map((countryData: any) =>
      limit(async () => {
        try {
          const currencyCode = countryData.currencies?.[0]?.code ?? null;

          // handle missing or unknown currencies gracefully
          const exchangeRate = currencyCode
            ? exchangeRates[currencyCode] ?? null
            : null;

          // GDP: population × random(1000–2000) ÷ exchange_rate
          let estimatedGdp: number | null = null;

          if (exchangeRate && exchangeRate > 0) {
            // const randomMultiplier =
            //   Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
            // estimatedGdp = Number(
            //   (BigInt(countryData.population) * BigInt(randomMultiplier)) /
            //     BigInt(Math.round(exchangeRate))
            // );
            estimatedGdp = calculateEstimatedGdp(
              BigInt(countryData.population),
              Number(Math.round(exchangeRate))
            );
          } else {
            estimatedGdp = 0;
          }

          await prisma.country.upsert({
            where: {
              name: countryData.name,
              // mode: "insensitive"
            },
            update: {
              capital: countryData.capital ?? null,
              region: countryData.region ?? null,
              population: BigInt(countryData.population),
              currency_code: currencyCode,
              exchange_rate: exchangeRate,
              estimated_gdp: estimatedGdp,
              flag_url: countryData.flag ?? null,
              last_refreshed_at: timestamp,
            },
            create: {
              name: countryData.name,
              capital: countryData.capital ?? null,
              region: countryData.region ?? null,
              population: BigInt(countryData.population),
              currency_code: currencyCode,
              exchange_rate: exchangeRate,
              estimated_gdp: estimatedGdp,
              flag_url: countryData.flag ?? null,
              last_refreshed_at: timestamp,
            },
          });

          processedCount++;
        } catch (error) {
          console.error(
            `Failed to process ${countryData.name}:`,
            (error as Error).message
          );
        }
      })
    );

    await Promise.all(upserts);

    // update metadata
    await prisma.metadata.upsert({
      where: { key: "updated_at" },
      update: { value: timestamp.toISOString() },
      create: { key: "updated_at", value: timestamp.toISOString() },
    });

    // generate summary image
    await generateSummaryImg();

    return {
      message: "Countries refreshed successfully",
      countries_processed: processedCount,
      timestamp: timestamp.toISOString(),
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("refresh failed:", axiosError.message);

    throw {
      status: 503,
      error: "External data source unavailable",
      details:
        axiosError.code === "ECONNABORTED"
          ? "External API timeout"
          : axiosError.message,
    };
  }
};

const generateSummaryImg = async () => {
  try {
    const totalCountries = await prisma.country.count();

    const topCountries = await prisma.country.findMany({
      where: { estimated_gdp: { not: null } },
      orderBy: {
        estimated_gdp: "desc",
      },
      take: 5,
      select: {
        name: true,
        estimated_gdp: true,
      },
    });

    const meta = await prisma.metadata.findUnique({
      where: { key: "updated_at" },
    });

    const lastRefreshed = meta?.value || new Date().toISOString();

    await generateImageSummary({
      totalCountries,
      topCountries: topCountries.map((c) => ({
        name: c.name,
        estimated_gdp: c.estimated_gdp || 0,
      })),
      lastRefreshed: new Date(lastRefreshed).toLocaleString(),
    });
  } catch (error) {
    console.log("error generating summary image:", error);
  }
};

export const getAllCountries = async (query: any) => {
  const { region, currency, sort } = query;

  const where: any = {};

  if (region) {
    where.region = {
      equals: region,
      mode: "insenitive",
    };
  }

  if (currency) {
    where.currencyCode = {
      equals: currency,
      mode: "insensitive",
    };
  }

  let orderBy: any = { name: "asc" };

  if (sort) {
    switch (sort) {
      case "gdp_desc":
        orderBy = { estimated_gdp: "desc" };
        break;
      case "gdp_asc":
        orderBy = { estimated_gdp: "desc" };
        break;
      case "population_desc":
        orderBy = { population: "desc" };
        break;
      case "population_desc":
        orderBy = { population: "desc" };
        break;
    }
  }

  const countries = await prisma.country.findMany({
    where,
    orderBy,
  });

  console.log("countries fetched:", countries.length);

  return countries;
};

/**
 * Get country by name (case-insensitive)
 */
export const getCountryByName = async (name: string) => {
  const country = await prisma.country.findFirst({
    where: {
      name: {
        equals: name,
        // mode: "insensitive",
      },
    },
  });

  console.log("country fetched:", country?.name);

  return country;
};

/**
 * Delete country by name (case-insensitive)
 */
export const deleteCountryByName = async (name: string) => {
  const country = await prisma.country.findFirst({
    where: {
      name: {
        equals: name,
        // mode: "insensitive",
      },
    },
  });

  if (!country) {
    return null;
  }

  await prisma.country.delete({
    where: { id: country.id },
  });

  return country;
};

/**
 * Get system status
 */
export const getStatus = async () => {
  const totalCountries = await prisma.country.count();

  const meta = await prisma.metadata.findUnique({
    where: { key: "last_refreshed_at" },
  });

  return {
    total_countries: totalCountries,
    last_refreshed_at: meta?.value || null,
  };
};
