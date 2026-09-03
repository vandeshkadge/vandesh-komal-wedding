const SHEET_NAME = 'Sheet1';

function doPost(e) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet not found: ${SHEET_NAME}`);
  }

  const data = JSON.parse(e.postData.contents);
  const name = String(data.name || '').trim();
  const attendance = data.attendance === 'accept' ? 'accept' : 'decline';
  const guests = Math.max(1, Math.min(6, Number(data.guests) || 1));

  if (!name) {
    throw new Error('Guest name is required');
  }

  sheet.appendRow([
    new Date(),
    name,
    attendance,
    guests
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, service: 'wedding-rsvp' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function testDoPost() {
  doPost({
    postData: {
      contents: JSON.stringify({
        name: 'Apps Script Test',
        attendance: 'accept',
        guests: 2
      })
    }
  });
}
