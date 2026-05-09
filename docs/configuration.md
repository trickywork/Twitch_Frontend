# Runtime Configuration

## Environment Variables

| Name | Required | Default | Purpose |
| --- | --- | --- | --- |
| `REACT_APP_API_BASE_URL` | No | `http://localhost:8080` | Backend base URL used at build time by Create React App. |

## Local Development

1. Start the backend in `/Users/junliu/git_repo/Twitch_backend`.
2. Copy `.env.example` to `.env`.
3. Run `npm install` if dependencies are missing.
4. Run `npm start`.

## Cloud Run

The frontend is a static React bundle served by Nginx. Because Create React App bakes environment variables at build time, update `_API_BASE_URL` in the Cloud Build trigger or manual build command whenever the backend URL changes.
