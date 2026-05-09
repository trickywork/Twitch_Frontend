# Twitch Frontend

React frontend for the Twitch Explorer portfolio project. It calls the Spring Boot backend in `Twitch_backend` and demonstrates game search, content browsing, recommendations, and saved favorites.

## Live Demo

- Portfolio URL: `https://twitch.junliu.dev`
- Cloud Run service: `twitch`
- Cloud Run URL: `https://twitch-888561484971.us-central1.run.app`
- Backend API: `https://twitch-api-888561484971.us-central1.run.app`
- Google Cloud project: `caramel-vim-441513-e1`
- Region: `us-central1`

The custom domain mapping exists in Cloud Run. If it is still pending, check the Cloudflare DNS record and Google-managed certificate status.

## Tech Stack

- React 19
- Create React App
- JavaScript
- CSS
- Runtime API configuration with `REACT_APP_API_BASE_URL`
- Nginx container for Cloud Run
- Google Cloud Build and Google Cloud Run

## Project Structure

```text
Twitch_frontend/
  public/
  src/
    App.js
    App.css
    index.js
  docs/
    configuration.md
  Dockerfile
  cloudbuild.yaml
  nginx.conf
  .env.example
```

## Features

- Search Twitch games.
- Browse content grouped by streams, videos, and clips.
- Save favorite content.
- Remove favorite content.
- View recommendation results from the backend.
- Works with backend demo mode, so visitors do not need Twitch API credentials.

## Local Development

Start the backend:

```bash
cd /Users/junliu/git_repo/Twitch_backend
PORT=8084 TWITCH_DEMO_MODE=true ./gradlew bootRun
```

Start the frontend:

```bash
cd /Users/junliu/git_repo/Twitch_frontend
cp .env.example .env
npm install
npm start
```

Expected local URLs:

```text
Frontend: http://localhost:3004
Backend:  http://localhost:8084
```

`.env.example` contains:

```env
PORT=3004
REACT_APP_API_BASE_URL=http://localhost:8084
```

Expected result:

- Game cards load from the backend.
- Searching a game updates the content results.
- Favorite and recommendation actions update the UI.

## API Contract

The frontend expects these backend endpoints:

```text
GET /health
GET /game
GET /search?game_id={id}
GET /recommendation
GET /favorite
POST /favorite
DELETE /favorite/{twitchId}
DELETE /favorite
```

Backend repo:

```text
/Users/junliu/git_repo/Twitch_backend
https://github.com/trickywork/Twitch_Backend
```

## Tests And Build

```bash
npm test -- --watchAll=false
npm run build
```

Build a local Docker image:

```bash
docker build \
  --build-arg REACT_APP_API_BASE_URL=http://localhost:8084 \
  -t twitch-frontend:local .
```

## Cloud Deployment

Manual deployment:

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions _API_BASE_URL=https://twitch-api-888561484971.us-central1.run.app \
  --project caramel-vim-441513-e1
```

The build arg embeds the backend API URL at build time:

```text
REACT_APP_API_BASE_URL=https://twitch-api-888561484971.us-central1.run.app
```

Cloud Run cost controls:

- static Nginx container
- `min-instances=0`
- `max-instances=1`
- 256Mi memory
- no database
- no persistent disk

## Expected Portfolio Behavior

A visitor should be able to open the deployed frontend, search or select games, browse related content, add favorites, remove favorites, and see recommendations. No login is required.

## Additional Notes

Runtime notes are in:

```text
docs/configuration.md
```
