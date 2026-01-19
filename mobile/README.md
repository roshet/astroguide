# AstroGuide Mobile App

This directory contains the mobile frontend for AstroGuide, built using React Native and Expo.

The app provides a chat-based interface that allows users to ask astronomy-related questions and receive AI-generated responses from the deployed backend.

---

## Tech Stack

- React Native
- Expo
- TypeScript
- AsyncStorage (local persistence)

---

## Project Structure

```
mobile/
├── app/
│   ├── _layout.tsx   # App layout and navigation
│   └── index.tsx     # Main chat screen
├── services/
│   └── api.ts        # Backend API client
├── assets/
│   └── images/       # App icons and splash assets
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Running the App Locally

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Open the app using:
- Expo Go (physical device)
- iOS simulator

---

## Backend Connection

The mobile app connects to a deployed backend via a public API URL defined in:

```
services/api.ts
```

No additional configuration is required to run the app.

---

## iOS Deployment Notes

Publishing the app to the App Store requires an Apple Developer account.

For this reason, the app currently runs via Expo’s development environment rather than a production App Store build.

---

## Notes

- The app is intentionally single-screen
- No tab navigation or template demo screens are included
- The UI is focused on clarity and usability