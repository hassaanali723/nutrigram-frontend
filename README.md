# NutriGram API

A FastAPI-based API for food image analysis and nutrition information.

## Features

- Food image analysis using Google's Gemma 3 model
- Nutrition information analysis
- Rate limiting for API endpoints
- Production-ready configuration

## Deployment

This application is deployed on Railway. To deploy your own instance:

1. Fork this repository
2. Create a new project on Railway
3. Connect your GitHub repository
4. Add the following environment variables in Railway:
   ```
   PRODUCTION=true
   SITE_URL=your_railway_app_url
   RAPIDAPI_KEY=your_rapidapi_key
   RAPIDAPI_HOST=your_rapidapi_host
   RAPIDAPI_URL=your_rapidapi_url
   RAPIDAPI_MODEL=ai_model
   CALORIE_NINJAS_API_KEY=your_calorieninjas_key
   ```

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nutrigram-api.git
   cd nutrigram-api
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your API keys (see `.env.example`)

5. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

## Rate Limiting

The API implements rate limiting:
- 5 requests per minute per IP address
- Rate limit information is included in response headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## License

MIT 
