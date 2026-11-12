# Captio

**Live English captions for any accent or language, in a floating window.**

Captio listens to a browser tab or your microphone, detects the spoken language, translates it to English, and shows captions in a window that stays on top of your class or meeting. No account needed.

**Live demo:** https://captio-live.vercel.app
**Demo video:** https://youtu.be/vMu5X7J86_0
**Pathway:** Hackathon (working prototype)
**Event:** STEMergent Ideathon & Hackathon

![Captio screenshot](public/screenshots/landing.png)
<!-- Add 3-4 screenshots or a GIF: landing page, source selection, captions running, Picture-in-Picture window -->

---

## The problem

Many students learn through content they struggle to follow in real time: online classes taught in unfamiliar accents, lectures on YouTube in a language they don't speak, and recorded sessions where the audio is unclear. Built-in captions are often unavailable, inaccurate with accents, or locked to a single platform.

For students without strong English or exposure to varied accents, this means missed lessons, extra effort, and falling behind, even when the learning material is free and online.

## Our solution

Captio gives any student live English captions for **any browser tab or microphone**, regardless of platform:

- Works on Google Meet, Zoom (web), YouTube, online classes, and any site with audio
- Detects the spoken language automatically and translates to English
- Shows captions in an always-on-top window so students can keep reading while they take notes or switch tabs
- Requires no sign-up, no database, and no payment

## Who it helps

- Students attending online classes with unfamiliar accents
- ESL and multilingual learners
- Students watching foreign-language lectures and tutorials
- Anyone who needs captions on platforms that don't provide them

## Features

- Browser tab audio capture (Google Meet, YouTube, online classes)
- Microphone capture
- Automatic language detection and translation to English
- Always-on-top caption window (Document Picture-in-Picture, Chrome and Edge)
- In-page floating window: drag, resize, transparency, minimize
- Pause, resume, clear, and copy the full transcript
- No sign-up, no database

## How it works

1. The browser captures audio with `getDisplayMedia` (tab) or `getUserMedia` (microphone).
2. Audio is cut into short 6-second segments. Silent segments are skipped.
3. Each segment is sent to `/api/transcribe`, a small Next.js route that keeps the API key on the server.
4. The route calls Groq's hosted Whisper `translations` endpoint, which returns English text.
5. Captions appear in order in the floating window.

## AI & third-party resources

In the spirit of the competition's disclosure rules:

- **Groq API (hosted Whisper):** speech recognition, language detection, and translation to English
- **Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Lucide React:** application framework and UI
- **Browser APIs:** Web Audio API, MediaRecorder, `getDisplayMedia`, Document Picture-in-Picture
- **AI coding assistance:** [DESCRIBE ANY AI TOOLS YOU USED, e.g. Claude / Copilot, and for what]

All product decisions, design, and integration work were done by the team during this competition.

## Team

**Solo participant:** Abdulrosheed Abdulmalik Adisa ([@abdulmalik-codeWithFaith](https://github.com/abdulmalik-codeWithFaith)), who handled the idea, design, development, and deployment.

## Getting started

Requirements: Node.js 18.18 or newer, and Chrome or Edge on a computer for tab capture.

```
git clone https://github.com/abdulmalik-codeWithFaith/captio.git
cd captio
npm install
cp .env.example .env.local
```

Create a free API key at [console.groq.com](https://console.groq.com), then put it in `.env.local`:

```
GROQ_API_KEY=your_key_here
```

Start the dev server and open [http://localhost:3000/translate](http://localhost:3000/translate):

```
npm run dev
```

## Using it

1. Choose **Browser tab** or **Microphone**.
2. Click **Start captions**. For tab capture, pick the tab and turn on **Share tab audio**.
3. Click the pop-out icon in the caption window to move it into an always-on-top window.
4. Switch to your class or meeting and read along.

## Privacy

- There are no accounts, and transcripts are not stored on a server.
- Audio segments are sent through the server to Groq for transcription. Check Groq's terms before using Captio for sensitive conversations.
- Only share audio you have the right to share, and follow local rules about recording conversations.

## Limitations

- A website cannot capture audio from desktop apps. Tab capture and microphone work. System-wide audio needs a desktop companion (Tauri or Electron), which is on the roadmap.
- Tab audio capture is supported in Chrome and Edge on desktop, not on most phones.
- The always-on-top window needs Chrome or Edge 116 or newer.
- Captions arrive roughly 6 to 9 seconds after speech, and words can be cut at segment boundaries.
- Groq's free tier has rate limits, so very long sessions can hit them. Captions resume after a short wait.
- Captions are automatic and can contain errors.

## Roadmap

- [ ] Overlapping segments for cleaner sentences and lower delay
- [ ] Transcript history in IndexedDB
- [ ] In-browser Whisper (`transformers.js`) as a free, key-less option
- [ ] Chrome extension
- [ ] Desktop companion for system-wide audio
- [ ] Meeting summaries and speaker identification

## Project structure

```
app/
  page.tsx                  Landing page
  translate/page.tsx        Source selection and caption controls
  api/transcribe/route.ts   Server route that calls the speech API
components/
  CaptionWindow.tsx         In-page floating window
  CaptionPanel.tsx          Window shown in Picture-in-Picture
lib/
  useLiveCaptions.ts        Audio capture, segmenting, requests
  usePictureInPicture.ts    Always-on-top window
```

## Tech stack

Next.js, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Web Audio API, MediaRecorder, Document Picture-in-Picture.

## Contributing

Contributions are welcome.

1. Fork the repo and create a branch.
2. Make your change and run `npm run lint`.
3. Open a pull request describing what you changed and how you tested it.

Good first areas: the roadmap items above, accessibility improvements, and testing across platforms and accents. Please open an issue first for large changes. Never commit API keys.

## License

[MIT](LICENSE)
