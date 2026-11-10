# Captio

Live English captions for any accent or language, in a floating window.

Captio listens to a browser tab or your microphone, detects the spoken language, translates it to English, and shows the captions in a window that stays on top of your meeting. No account needed.

> Built for people who struggle to follow unfamiliar accents in meetings, or who watch content in a language they don't speak.

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
3. Each segment is sent to `/api/transcribe`, a small Next.js route that holds the API key on the server.
4. The route calls Groq's hosted Whisper `translations` endpoint, which returns English text.
5. Captions appear in order in the floating window.

## Getting started

Requirements: Node.js 18.18 or newer, and Chrome or Edge on a computer for tab capture.

```bash
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

```bash
npm run dev
```

## Using it

1. Choose **Browser tab** or **Microphone**.
2. Click **Start captions**. For tab capture, pick the tab and turn on **Share tab audio**.
3. Click the pop-out icon in the caption window to move it into an always-on-top window.
4. Switch to your meeting and read along.

## Privacy

- There are no accounts, and transcripts are not stored on a server.
- Audio segments are sent through your server to Groq for transcription. Check Groq's terms before using Captio for sensitive conversations.
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

Good first areas: the roadmap items above, accessibility improvements, and testing across meeting platforms and accents. Please open an issue first for large changes. Never commit API keys.

## Support the project

If Captio helps you, star the repo on GitHub. It helps other people find it.

## License

[MIT](./LICENSE)