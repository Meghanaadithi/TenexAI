# API (JS)

Base `/api`

- `POST /auth/register` {email, password}
- `POST /auth/login` {email, password} -> {token}
- `POST /logs/upload` multipart: file, logType=auto|zscaler|apache
- `GET /logs`
- `GET /logs/:uploadId/events?limit=200&offset=0`
- `GET /logs/:uploadId/anomalies`
- `GET /logs/:uploadId/summary`
