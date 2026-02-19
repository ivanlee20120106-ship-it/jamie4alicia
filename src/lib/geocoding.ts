const USER_AGENT = "JamieForAlicia/1.0 (lovable.app)";
const MIN_INTERVAL = 1100; // slightly over 1s to respect Nominatim policy

let lastRequest = 0;

const throttle = async () => {
  const now = Date.now();
  const wait = MIN_INTERVAL - (now - lastRequest);
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastRequest = Date.now();
};

export const geocodeSearch = async (query: string) => {
  await throttle();
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=en`,
    { headers: { "User-Agent": USER_AGENT } }
  );
  return res.json();
};

export const geocodeReverse = async (lat: number, lng: number): Promise<string> => {
  await throttle();
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
      { headers: { "User-Agent": USER_AGENT } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
};
