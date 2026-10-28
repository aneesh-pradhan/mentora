# Mentora

An AI mentor that turns a goal into a learning roadmap, tracks your progress, and talks it through with you. Built at CalHacks 12.0.

## What's here

- `frontend/`: the Next.js app. It has the goals dashboard, roadmap generation, and a chat with the mentor agent, which runs on [Letta](https://www.letta.com/).
- `backend/`: a Python project for the voice agent (LiveKit and Deepgram). Only its scaffolding is in this repo.

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000.
