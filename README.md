# AstroGuide

AstroGuide is an AI-powered astronomy assistant that allows users to ask questions about space, planets, galaxies, and astrophysics through a mobile-friendly chat interface.

The project is structured as a monorepo with:
- A FastAPI backend that handles AI responses
- A React Native (Expo) mobile app that provides the chat UI

This repository focuses on clarity, simplicity, and real deployment.

---

## Tech Stack

### Backend
- Python
- FastAPI
- OpenAI API
- Railway (deployment)

### Mobile
- React Native
- Expo
- TypeScript

---

## Repository Structure

```
astroguide/
├── backend/   # FastAPI backend
├── mobile/    # React Native / Expo mobile app
└── README.md
```

---

## Features

- AI-powered astronomy Q&A
- Beginner and advanced response modes
- Source-aware answers
- Persistent chat history
- Light and dark mode support
- Deployed backend with live API access

---

## Running the Project

Each part of the project has its own setup instructions:

- Backend setup: see `backend/README.md`
- Mobile app setup: see `mobile/README.md`

---

## Mobile Deployment Notes

The backend is fully deployed and publicly accessible.

The mobile app is built using Expo. Publishing the iOS app outside of local development requires an Apple Developer account, so the app currently runs via Expo’s development environment.

---

## Future Improvements

- User authentication
- Persistent user profiles
- Android production build
- UI polish and animations
- Integration with external astronomy APIs (e.g., NASA)

---

## License

MIT