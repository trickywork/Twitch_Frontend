# Twitch Frontend

React frontend for the Twitch Explorer portfolio demo. It calls the Spring Boot backend from `Twitch_backend` and supports game search, content tabs, recommendations, and saved favorites.

## Local Run

```bash
cp .env.example .env
npm install
npm start
```

By default the frontend calls `http://localhost:8084` when using `.env.example`. Set `REACT_APP_API_BASE_URL` when the backend runs elsewhere:

```bash
PORT=3004 REACT_APP_API_BASE_URL=https://your-backend-url npm start
```

## Build

```bash
npm test -- --watchAll=false
npm run build
docker build --build-arg REACT_APP_API_BASE_URL=http://localhost:8084 -t twitch-frontend:local .
```

## Deployment

The included `cloudbuild.yaml` builds an Nginx image and deploys it to Cloud Run with `min-instances=0` and `max-instances=1`.

When creating a build trigger, set `_API_BASE_URL` to the deployed backend URL.

## Documentation

- [Runtime configuration](docs/configuration.md)
