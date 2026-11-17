// Single shared InsForge client for the whole app.
//
// Both values come from your InsForge project (dashboard → Install → API Keys,
// or `npx @insforge/cli secrets get ANON_KEY`). The anon key is meant to be
// public — every table is protected by row-level security (see /migrations).
import { createClient } from "@insforge/sdk";

const baseUrl = import.meta.env.VITE_INSFORGE_BASE_URL;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing VITE_INSFORGE_BASE_URL / VITE_INSFORGE_ANON_KEY — copy frontend/.env.example to frontend/.env and fill them in.",
  );
}

export const insforge = createClient({ baseUrl, anonKey });

export const MEDIA_BUCKET = "media";
