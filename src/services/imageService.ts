import { createCanvas, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';

interface TopCountry {
  name: string;
  estimated_gdp: number;
}

interface SummaryData {
  totalCountries: number;
  topCountries: TopCountry[];
  lastRefreshed: string;
}

const IMAGE_PATH = path.join(process.cwd(), 'cache', 'summary.png');

/**
 * Ensure cache directory exists
 */
const ensureCacheDir = () => {
  const cacheDir = path.join(process.cwd(), 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
};

/**
 * Format number with commas
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Generate summary image
 */
export const generateImageSummary = async (data: SummaryData): Promise<void> => {
  try {
    ensureCacheDir();
    
    const width = 900;
    const height = 650;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#312e81');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Country Data Summary', width / 2, 80);

    // total countries box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, 120, width - 100, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Total Countries: ${data.totalCountries}`, width / 2, 165);

    // top 5 countries title
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Top 5 Countries by GDP', 50, 260);

    // top 5 countries list
    ctx.font = '22px Arial';
    let yPos = 310;
    
    data.topCountries.forEach((country, index) => {
      // rank circle
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(80, yPos, 18, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${index + 1}`, 80, yPos + 7);
      
      // country name and GDP
      ctx.fillStyle = '#ffffff';
      ctx.font = '22px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(country.name, 120, yPos + 7);
      
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '20px Arial';
      const gdpText = `$${formatNumber(country.estimated_gdp)}`;
      ctx.fillText(gdpText, 120, yPos + 35);
      
      yPos += 70;
    });

    // timestamp
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Last updated: ${data.lastRefreshed}`, width / 2, height - 30);

    // save image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(IMAGE_PATH, buffer);
    
    console.log('summary image generated successfully');
  } catch (error) {
    console.error('cailed to generate summary image:', error);
    throw error;
  }
};

/**
 * Check if summary image exists
 */
export const summaryImageExists = (): boolean => {
  return fs.existsSync(IMAGE_PATH);
};

/**
 * Get summary image path
 */
export const getSummaryImagePath = (): string => {
  return IMAGE_PATH;
};