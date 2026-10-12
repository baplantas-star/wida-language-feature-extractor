// Server side: only serves pages and reads the user's selection.
// All analysis runs in the browser (Engine.html). No calls to any AI service.

/** Standalone web app. */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('WIDA Language Feature Extractor');
}

/** Adds a menu in Docs or Sheets that opens the sidebar. */
function onOpen(e) {
  var ui = getUi_();
  if (ui) ui.createAddonMenu().addItem('Open sidebar', 'showSidebar').addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  var page = HtmlService.createTemplateFromFile('Index');
  page.surface = 'sidebar';
  getUi_().showSidebar(page.evaluate().setTitle('WIDA Feature Extractor'));
}

/** Pulls another HTML file into a page: <?!= include('Ui') ?> */
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/** Returns the text the user has selected in Docs or Sheets (empty if none). */
function getSelectedText() {
  if (isDocs_()) {
    var selection = DocumentApp.getActiveDocument().getSelection();
    if (!selection) return '';
    return selection.getRangeElements().map(function (r) {
      var el = r.getElement();
      if (!el.editAsText) return '';
      var text = el.asText().getText();
      return r.isPartial() ? text.substring(r.getStartOffset(), r.getEndOffsetInclusive() + 1) : text;
    }).join('\n');
  }
  if (isSheets_()) {
    var range = SpreadsheetApp.getActiveRange();
    if (!range) return '';
    return range.getDisplayValues().map(function (row) { return row.join(' '); }).join('\n');
  }
  return '';
}

function isDocs_() {
  try { return !!DocumentApp.getActiveDocument(); } catch (e) { return false; }
}

function isSheets_() {
  try { return !!SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { return false; }
}

function getUi_() {
  if (isDocs_()) return DocumentApp.getUi();
  if (isSheets_()) return SpreadsheetApp.getUi();
  return null;
}
