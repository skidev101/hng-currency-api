# Currency and Exchange rate API

## Overview
This is a RESTful API built with Node.js, Express, and TypeScript. It utilizes Prisma as an ORM to interact with a MySQL database, providing comprehensive data on countries and their exchange rates by fetching and processing information from external sources.

## Features
- **Express**: Powering the robust and scalable RESTful API server.
- **Prisma**: Providing a type-safe ORM for seamless database interaction with MySQL.
- **TypeScript**: Ensuring code quality and maintainability with static typing.
- **Axios**: Handling HTTP client requests to fetch data from external country and currency APIs.
- **`express-rate-limit`**: Implementing rate limiting to protect endpoints from abuse.
- **`pureimage`**: Dynamically generating a summary PNG image of country data.

## Getting Started
### Installation
Follow these steps to set up the project locally.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/skidev101/hng-currency-api.git
    cd hng-currency-api
    ```

2.  **Install dependencies:**
    This project uses `pnpm` as the package manager.
    ```bash
    pnpm install
    ```

3.  **Set up the database:**
    Create a `.env` file in the root directory and add the necessary environment variables (see below). Then, run the Prisma migration to set up your database schema.
    ```bash
    pnpm prisma:migrate
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    The server will start on the port specified in your `.env` file (default is 3000).

### Environment Variables
Create a `.env` file in the project root directory and add the following variables.

```env
# Database
DATABASE_URL="mysql://user:password@host:port/database_name"

# Server
PORT=3000

# External APIs
COUNTRIES_API_URL="https://restcountries.com/v2/all"
EXCHANGE_RATES_API_URL="https://api.exchangerate-api.com/v4/latest/USD"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
REFRESH_RATE_LIMIT_MAX=5
```

## API Documentation
### Base URL
All API endpoints are relative to the server's base URL. For local development, this is typically `http://localhost:3000`.

### Endpoints
#### GET /health
Checks the operational status of the server.

**Request**:
No payload required.

**Response**:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

**Errors**:
- `500`: Internal Server Error if the server encounters an unexpected issue.

---
#### GET /status
Retrieves metadata about the dataset, including the total number of countries and the last data refresh time.

**Request**:
No payload required.

**Response**:
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2024-08-01T10:30:00.000Z"
}
```

**Errors**:
- `500`: Internal Server Error.

---
#### POST /countries/refresh
Triggers a refresh of the country and currency data from external APIs. This is a rate-limited operation.

**Request**:
No payload required.

**Response**:
```json
{
  "message": "Countries refreshed successfully",
  "countries_processed": 250,
  "timestamp": "2024-08-01T10:30:00.123Z"
}
```

**Errors**:
- `429`: Too many requests. Triggered if the refresh limit is exceeded.
- `503`: External data source unavailable.
- `500`: Internal Server Error.

---
#### GET /countries
Fetches a list of all countries. Supports filtering by region and currency, and sorting.

**Request**:
Query Parameters (optional):
- `region` (string): Filter countries by region (e.g., `?region=Africa`).
- `currency` (string): Filter countries by currency code (e.g., `?currency=NGN`).
- `sort` (string): Sort results. Options: `gdp_desc`, `gdp_asc`, `population_desc`, `population_asc`.

**Response**:
An array of country objects.
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139587,
    "currency_code": "NGN",
    "exchange_rate": 1250.50,
    "estimated_gdp": 257715456789.12,
    "flag_url": "https://restcountries.eu/data/nga.svg",
    "last_refreshed_at": "2024-08-01T10:30:00.000Z"
  }
]
```

**Errors**:
- `500`: Internal Server Error.

---
#### GET /countries/:name
Retrieves detailed information for a single country by its name.

**Request**:
URL Parameter:
- `name` (string): The full name of the country (e.g., `/countries/Nigeria`).

**Response**:
A single country object.
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139587,
  "currency_code": "NGN",
  "exchange_rate": 1250.50,
  "estimated_gdp": 257715456789.12,
  "flag_url": "https://restcountries.eu/data/nga.svg",
  "last_refreshed_at": "2024-08-01T10:30:00.000Z"
}
```

**Errors**:
- `404`: Country not found.
- `500`: Internal Server Error.

---
#### DELETE /countries/:name
Deletes a country from the database by its name.

**Request**:
URL Parameter:
- `name` (string): The full name of the country to delete (e.g., `/countries/Nigeria`).

**Response**:
```json
{
  "message": "Country deleted successfully",
  "name": "Nigeria"
}
```

**Errors**:
- `404`: Country not found.
- `500`: Internal Server Error.

---
#### GET /countries/image
Returns a dynamically generated PNG image summarizing key country data, such as total countries and top 5 by GDP.

**Request**:
No payload required.

**Response**:
A `image/png` file stream.

**Errors**:
- `404`: Summary image not found (may not have been generated yet).
- `500`: Internal Server Error.