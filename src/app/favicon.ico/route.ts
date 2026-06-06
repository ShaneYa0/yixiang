const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#FAF6EE"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#2C2416" stroke-width="3"/>
  <path d="M32 12a20 20 0 0 1 0 40a10 10 0 0 0 0-20a10 10 0 0 1 0-20Z" fill="#2C2416"/>
  <circle cx="32" cy="22" r="4" fill="#FAF6EE"/>
  <circle cx="32" cy="42" r="4" fill="#2C2416"/>
</svg>`;

export function GET() {
  return new Response(icon, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
