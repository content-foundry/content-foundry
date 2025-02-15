import { init, me } from "@replit/extensions";
const updatable = document.querySelector(".updatable");
const { dispose } = await init({ timeout: 1000 });
const filePath = await me.filePath();
if (!filePath) {
  updatable.textContent = "Not found";
  dispose();
}
updatable.innerHTML = `Loading ${filePath}...`;
globalThis.location.assign(
  `${globalThis.ENVIRONMENT.nextUrl}?filePath=${filePath}`,
);
