import fs from "fs";
import path from "path";
import * as PImage from "pureimage";

interface TopCountry {
  name: string;
  estimated_gdp: number;
}

interface SummaryData {
  totalCountries: number;
  topCountries: TopCountry[];
  lastRefreshed: string;
}

const IMAGE_PATH = path.join(process.cwd(), "cache", "summary.png");

/**
 * Ensure cache directory exists
 */
const ensureCacheDir = () => {
  const cacheDir = path.join(process.cwd(), "cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
};

/**
 * Format number with commas
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Generate summary image
 */
export const generateImageSummary = async (
  data: SummaryData
): Promise<void> => {
  try {
    ensureCacheDir();

    // register custom font
    const fontPath = path.join(__dirname, "../../fonts/Roboto-Medium.ttf");
    let fontLoaded = false;
    if (fs.existsSync(fontPath)) {
      const robotoFont = PImage.registerFont(fontPath, "RobotoMedium");
      await robotoFont.load();
      fontLoaded = true;
      console.log("font loaded at image service")
    }

    const width = 800;
    const height = 1000;
    const img = PImage.make(width, height);
    const ctx = img.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // title
    ctx.font = fontLoaded ? "40px RobotoMedium" : "40px sans-serif";
    ctx.fillText("Country Data Summary", width / 2, 100);

    // total countries
    ctx.font = fontLoaded ? "28px RobotoMedium" : "28px sans-serif";
    ctx.fillText(`Total Countries: ${data.totalCountries}`, width / 2, 160);

    ctx.font = fontLoaded ? "30px RobotoMedium" : "30px sans-serif";
    ctx.fillText("Top 5 Countries by Estimated GDP", width / 2, 240);

    // top countries list
    ctx.textAlign = "left";
    let yPos = 290;
    const xName = 80;
    const xGdp = 550;

    ctx.font = fontLoaded ? "22px RobotoMedium" : "22px sans-serif";

    data.topCountries.forEach((country, index) => {
      const gdp = `$${formatNumber(country.estimated_gdp)}`;
      ctx.fillText(`${index + 1}. ${country.name}`, xName, yPos);
      ctx.fillText(gdp, xGdp, yPos);
      yPos += 40;
    });

    ctx.textAlign = "center";
    ctx.font = fontLoaded ? "18px RobotoMedium" : "18px sans-serif";
    ctx.fillText(`Last updated: ${data.lastRefreshed}`, width / 2, height - 60);

    await PImage.encodePNGToStream(img, fs.createWriteStream(IMAGE_PATH));
    console.log("summary image generated successfully");
  } catch (error) {
    console.error("failed to generate summary image:", error);
    throw error;
  }
};

/**
 * Check if summary image exists
 */
export const summaryImageExists = (): boolean => fs.existsSync(IMAGE_PATH);

/**
 * Get summary image path
 */
export const getSummaryImagePath = (): string => IMAGE_PATH;
