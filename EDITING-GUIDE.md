# Wedding Invitation Editing Guide

For normal wedding updates, edit only `wedding-data.json`.

After editing the JSON, refresh the invitation in your browser. Keep the local server running because the page loads the JSON file over HTTP.

## Change Couple Details

Edit the `couple` section:

```json
"couple": {
  "name1": "Vandesh",
  "name2": "Komal",
  "displayName": "Vandesh & Komal",
  "monogram": "V & K",
  "sealMonogram": "V&K"
}
```

Use `displayName` for the full name shown in the letter and page title. The other fields control the separate name and monogram areas.

## Change Date And Time

Edit the `wedding` section:

```json
"wedding": {
  "date": "2026-12-13",
  "displayDate": "DECEMBER 13, 2026",
  "day": "SUNDAY",
  "countdownTime": "17:46",
  "timezone": "Asia/Kolkata"
}
```

Use the date format `YYYY-MM-DD` and 24-hour time for `countdownTime`. The calendar and countdown update from these values.

## Change Venue

Edit the `venue` section. The venue heading, city, address, Maps button, and copy-address button use these values:

```json
"venue": {
  "name": "Monalisa Lawn And Banquet",
  "city": "Thane, Maharashtra",
  "address": "Your address here",
  "shortLocation": "Thane, Maharashtra",
  "mapsUrl": "https://your-maps-link-here"
}
```

## Add Or Update Events

Edit the `events` list. Each event needs these fields:

```json
{
  "id": "example-event",
  "name": "EVENT NAME",
  "date": "2026-12-13",
  "displayDate": "DECEMBER 13, 2026",
  "time": "5:46 PM",
  "location": "Venue name",
  "mapsUrl": "",
  "description": ""
}
```

For an event that is not confirmed, leave `date` empty and use clear configured text such as `DATE TO BE CONFIRMED`. Do not invent missing details.

## Change Story, Hashtag, And Images

- Story text: edit `story.body`.
- Story title: edit `story.sectionTitle`.
- Story label: edit `story.eyebrow`.
- Footer hashtag: edit `hashtag`.
- Image paths: edit the four values under `images`, then replace the matching local files while keeping their filenames.

## Google Sheets RSVP

The RSVP connection is configured here:

```json
"integrations": {
  "googleSheets": {
    "enabled": true,
    "webAppUrl": "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"
  }
}
```

Do not change `webAppUrl` unless you deploy a new Apps Script Web App. Guests do not need Google accounts. Each submission sends:

```json
{
  "name": "Guest name",
  "attendance": "accept",
  "guests": 2
}
```

Responses are managed in the connected Google Sheet.

The complete Apps Script is in `google-sheets-apps-script.gs`. Copy that file into the Apps Script editor attached to your Sheet. The deployment must include both `doPost(e)` and `doGet()` and must be deployed as a Web app with **Execute as: Me** and **Who has access: Anyone**. If the endpoint shows `Script function not found: doPost`, redeploy the Web app after adding the script.

## Music

Music is currently disabled. To enable it after adding a local audio file:

```json
"music": {
  "enabled": true,
  "file": "audio/song.mp3",
  "title": "Song title",
  "artist": "Artist name"
}
```

## What Not To Edit

Do not edit `index.html` for normal content updates. It contains the layout, styling, animations, and JavaScript behavior. Edit it only when changing the visual design or adding a new feature.

Always keep JSON syntax valid: use double quotes, commas between fields, and no comma after the last field. If the page becomes blank after an edit, validate `wedding-data.json` first.

## Preview Locally

From the project folder, run:

```text
npx.cmd --yes http-server -p 4173
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

Opening `index.html` directly with `file://` prevents the browser from loading `wedding-data.json`.
