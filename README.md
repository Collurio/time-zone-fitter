# Time Zone Fitter

A small touch/mouse-friendly GUI for finding a workable online meeting time across multiple time zones.

## Features

- Add 2+ parties, each with an IANA time zone.
- Edit and remove existing parties.
- Drag a UTC time slider and see per-party local time update in real time.
- Use country/common-name timezone input with suggestions for matching zones.
- Switch each party between global and customized color ranges with right-click or long-press.
- Per-party convenience band shown with color:
  - Green: 08:00-18:00
  - Yellow: 18:00-24:00
  - Red: 00:00-06:00
  - Orange: 06:00-08:00
- Edit convenience bands from the UI (0-24 hour boundaries).
- Flexible timezone input with suggestions (e.g. country/common names such as "Sweden" -> CET / Europe/Stockholm).
- Overall convenience meter for quick scanning.

## Run

Open [index.html](index.html) directly in a browser.

Or serve locally:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080
