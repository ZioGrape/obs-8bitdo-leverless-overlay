# OBS 8BitDo Leverless Overlay

A browser-based stream overlay that visualizes button presses on the **8BitDo Arcade Controller** — a leverless (hitbox-style) fighting stick — in real time, for use as an OBS Browser Source.

No build step, no dependencies: plain HTML/CSS/JS, editable directly in the browser.

## Features

- Reads input live via the Gamepad API (with keyboard fallback for testing without a controller connected)
- Visual layout traced from reference photos of the real controller, so on-screen buttons line up with the physical ones
- Built-in editor: reposition/relabel buttons, rebind inputs, set idle/active colors per button
- Dark and Neon color presets
- Export/import your layout as a JSON config file
- Config persists locally (`localStorage`) between sessions
- Transparent background in overlay mode for clean OBS compositing

## Usage

1. Open `index.html` in a browser to enter edit mode and customize the layout, colors, and bindings.
2. In OBS, add a **Browser Source** pointing at `index.html?overlay=1` (this hides the editor UI and keeps the background transparent).
3. Connect your 8BitDo Arcade Controller — the on-screen overlay will mirror button presses live.

Your configuration can be exported/imported via the toolbar so you can back it up or move it between machines.

## License

TBD
