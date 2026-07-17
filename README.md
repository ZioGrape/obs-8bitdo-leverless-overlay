# OBS 8BitDo Leverless Overlay

A browser-based stream overlay that visualizes button presses on the **8BitDo Arcade Controller** — a leverless (hitbox-style) fighting stick — in real time, for use as an OBS Browser Source.

No build step, no dependencies: plain HTML/CSS/JS, editable directly in the browser.

## Features

- Reads input live via the Gamepad API (with keyboard fallback for testing without a controller connected)
- Visual layout traced from reference photos of the real controller, so on-screen buttons line up with the physical ones
- Built-in editor: reposition/relabel buttons, rebind inputs, set idle/active colors per button
- Color presets — Dark (Xbox edition), Standard, and Purple Signature Edition — each traced from that edition's own reference photos
- Controller layouts — Xbox, Street Fighter 6 (LP/MP/HP/LK/MK/HK + Drive Impact/Parry), Nintendo Switch (X/Y and A/B swapped, R/L/ZR/ZL) — independent of the color preset
- RU/EN interface localization
- Export/import your layout as a JSON config file
- Config persists locally (`localStorage`) between sessions
- Transparent background in overlay mode for clean OBS compositing

## Usage

1. Open `index.html` in a browser to enter edit mode and customize the layout, colors, and bindings.
2. In OBS, add a **Browser Source** pointing at `index.html?overlay=1` (this hides the editor UI and keeps the background transparent).
3. Connect your 8BitDo Arcade Controller — the on-screen overlay will mirror button presses live.

Your configuration can be exported/imported via the toolbar so you can back it up or move it between machines.

## Disclaimer

This is an unofficial, fan-made tool. It is not affiliated with, endorsed by, or sponsored by 8BitDo, Microsoft, Nintendo, or Capcom. The controller layout was recreated from reference photos for personal use and shared publicly in case it's useful to others. All product names, logos, and brands referenced are property of their respective owners.

## License

The code in this repository is licensed under the [MIT License](LICENSE). This covers the original source code only — it does not grant any rights to third-party trademarks or logos referenced or depicted in the project.
