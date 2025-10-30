import { Router } from 'express';
import * as countryController from '../controllers/countryController.js';
import { refreshLimiter } from '../middleware/rateLimiter.js';

const router: Router = Router();

// POST /countries/refresh - Refresh countries data
router.post('/refresh', refreshLimiter, countryController.refreshCountries);

// GET /countries - Get all countries with filters
router.get('/', countryController.getAllCountries);

// GET /countries/image - Get summary image (before /:name to avoid conflict)
router.get('/image', countryController.getSummaryImage);

// GET /countries/status - Get total countries and last refresh timestamp (before /:name to avoid conflict)
router.get('/', countryController.getStatus);

// GET /countries/:name - Get specific country
router.get('/:name', countryController.getCountryByName);

// DELETE /countries/:name - Delete country
router.delete('/:name', countryController.deleteCountryByName);

export default router;