# pokeclicker-ui-fix

Small extension for the game https://pokeclicker.com that adds a button to fill the breeding queue, since the admins do not want to implement it.

## Installation (Chrome)

1. Download this repository (Code > Download ZIP) and extract it, or clone it with Git.
2. Ensure the folder contains at least `manifest.json` and `content.js`.
3. (Optional) If you play on a non-`www` URL or sub‑paths, you can edit `manifest.json` to broaden `matches` to:
	- `"https://www.pokeclicker.com/*"`
	- `"https://pokeclicker.com/*"`
4. Open `chrome://extensions` in Chrome.
5. Toggle on "Developer mode" (top right).
6. Click "Load unpacked" and select the extracted folder.
7. Navigate to https://www.pokeclicker.com (or the domain you added).
8. Open the breeding modal in game; when the queue isn’t full you’ll see the green "Fill Queue" button where the full‑queue warning normally appears.
9. Click it to auto-fill the queue with the first Pokémon repeatedly until full.

### Updating
When you make changes, just go back to `chrome://extensions` and press the refresh/reload icon on the extension card.

### Uninstalling
Open `chrome://extensions`, find the extension, and click "Remove".

### Notes
- The script relies purely on DOM inspection (no direct game API access) due to MV3 content script isolation.
- If the layout changes and the button disappears, check class names in the breeding modal and adjust selectors in `content.js` (`.hatchery-warnings`, `#breedingModal`, `#breeding-pokemon-list-container`).

## Firefox

Not working yet (placeholder). The extension currently targets Chromium browsers; a Firefox-compatible version will be explored later.

## Contributing

Issues and pull requests are welcome.

- For bug reports: include your browser version, a short reproduction (steps to open the breeding modal), and any console errors if relevant.
- For feature requests: describe the use case and proposed behavior.
- Code style: keep it simple, no external dependencies; prefer small functions and clear selectors. Avoid console logs in production code.
- Scope: this extension only adds the "Fill Queue" button and behavior; broader gameplay changes are out of scope.

## License

MIT

