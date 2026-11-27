# Mentora

Mentora turns a learning goal into a roadmap and talks it through with you. The web app collects the goal, stores the roadmap, and chats with a [Letta](https://www.letta.com/) mentor. Built at CalHacks 12.0.

## Demo

No screenshot or recording is in the repo. Run the frontend and open the app locally:

- http://localhost:3000 — goal prompt
- http://localhost:3000/chat — mentor chat

When you have a real capture, add it under `docs/` and embed it here. This section is left empty on purpose.

## Architecture

The browser talks to a Next.js app. Roadmap generation is meant to go through a Python API, and the mentor conversation goes through Letta.

```text
Browser
  └─ Next.js 16 (frontend/)
       ├─ /                 goal prompt
       │    ├─ Firestore    create / subscribe / update a roadmap document
       │    └─ POST {API}/generate-roadmap
       ├─ /chat             streams tokens from POST /api/letta
       └─ POST /api/letta   server route, Letta via LETTA_API_KEY
Python package (backend/)
  ├─ intended: Flask POST /generate-roadmap and a LiveKit voice agent
  │            (Deepgram speech-to-text, Tavus avatar, Letta as the LLM)
  └─ in this repo: Poetry manifest and an empty importable package
```

`frontend/src/lib/api.ts` and `frontend/src/lib/roadmap-service.ts` were missing from git. They are reconstructed from `src/app/page.tsx` and from the Flask route that previously existed only as committed bytecode: `POST /generate-roadmap` with `{ course_theme, max_depth? }`, returning JSON that includes `nodes` (and `edges` when the server sends them). Roadmap documents are written to the Firestore collection `roadmaps`.

The home page redirects to `/roadmap/[id]` after a successful generation. That route was never committed, so the redirect has no page yet.

The voice-agent and course-orchestration Python sources were not committed. Compiled `__pycache__` files used to be tracked; they are ignored now and are not part of a clone. There is no backend process to start.

## Prerequisites

Versions below are what this repo was installed and built with.

| Tool | Required | Verified with |
| --- | --- | --- |
| Node.js | 20.9 or newer (Next.js 16.0.0) | 22.23.4 |
| npm | 10, the npm that ships with that Node | 10.9.9 |
| Python | 3.11 or newer, and below 4 | 3.12.3 |
| Poetry | 2.1.3 (the version that generated `backend/poetry.lock`) | 2.1.3 |

Install Poetry if you do not already have 2.1.3:

```bash
curl -sSL https://install.python-poetry.org | python3 - --version 2.1.3
export PATH="$HOME/.local/bin:$PATH"
```

## Backend

From a clean clone, in the repository root:

```bash
cd backend
cp .env.example .env
poetry install
poetry check --lock
poetry run python -c "import backend; print('backend import ok')"
```

Edit `backend/.env` with your own Letta, Tavus, Deepgram, and LiveKit credentials. The example file lists each variable. Nothing in the committed Python package reads those values yet, because the agent source is not in the repo. There is no unit test suite. The import command above is the check.

CI runs this job on Ubuntu 24.04 with Poetry installed on Python 3.12. Poetry installed on Python 3.14 rejects the `livekit-blingfire` wheels in the lockfile, which is what happens if `pipx` uses the default Python on Ubuntu 26.04.

## Frontend

From a clean clone, in the repository root:

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run lint
npm run build
npm run dev
```

`npm run lint` exits 0. It still prints existing warnings in UI components. `npm run build` is the production build. `npm run dev` serves http://localhost:3000.

There is no frontend test suite. Lint and build are the checks, and CI runs those plus the backend import.

Fill in `frontend/.env.local` before using the live features:

- `LETTA_API_KEY` — server-only key for `POST /api/letta`. Get it from https://app.letta.com.
- `NEXT_PUBLIC_LETTA_AGENT_ID` — agent id (`agent-<uuid>`) the chat page sends.
- `NEXT_PUBLIC_API_BASE_URL` — roadmap API, default `http://localhost:5000`.
- `NEXT_PUBLIC_FIREBASE_*` — Firebase web config. The home page writes roadmaps to Cloud Firestore and will throw a clear error until these are set.

Generating a roadmap also needs the Python `/generate-roadmap` service, which is not in this repo. Chat needs a Letta key and agent id. The pages still build and render without those secrets.

## Secrets

`backend/.env` used to be committed and is no longer tracked. The old key values are still in git history. Rotating the keys does not remove them from old commits. Purging history (for example `git filter-repo`, followed by a force push) is a separate decision and is not part of normal development on this repo.

## License

MIT. Copyright 2026 Aneesh Pradhan. See [LICENSE](LICENSE).
