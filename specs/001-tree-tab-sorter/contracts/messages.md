# Message Contracts: TST Tree Sorter

## Background <-> Tree Style Tab (External)

### Get Tree Structure
**Request (to TST)**:
*Note: Internal `windowId` maps to TST external `window` field.*
```json
{
  "type": "get-tree",
  "window": 123
}
```
**Response**:
Array of tab objects with TST metadata (`indent`, `parentId`).

### Move Tab (to TST)
**Request**:
```json
{
  "type": "attach",
  "tab": 456,
  "parent": 123,
  "insertBefore": 789
}
```
**Action**: Moves tab 456 under parent 123, positioned before sibling 789.

## Popup <-> Background (Internal)

### Load Settings
**Request**:
```json
{ "action": "getSettings" }
```
**Response**:
Current `Settings` object from `browser.storage.sync`.

### Update Setting
**Request**:
```json
{
  "action": "updateSetting",
  "key": "string",
  "value": "any"
}
```
**Action**: Updates storage and broadcasts change.

### Scroll to Tab (to TST)
**Request**:
```json
{
  "type": "scroll",
  "tab": 456
}
```
**Action**: Scrolls the TST sidebar to bring the specified tab into view. Used after sorting to ensure the active tab is visible (FR-010).

## Confirm Dialog ↔ Background (Internal)

### Confirm Sort
**Request** (from background to confirm.html popup):
```json
{
  "action": "confirmSort",
  "tabCount": 55,
  "isGlobal": false
}
```
**Response** (from confirm.js back to background):
```json
{
  "action": "confirmResult",
  "confirmed": true,
  "dontShowAgain": false
}
```
**Action**: If `confirmed` is true, proceed with sorting. If `dontShowAgain` is true, update the appropriate suppression setting (`disableConfirmation` or `disableGlobalConfirmation`) in storage.

---

## Error Responses

### TST Extension Not Installed / Not Responding
If TST is not installed or fails to respond to `runtime.sendMessage`, the addon receives a rejected promise or `undefined` response.

**Handling**: Display a persistent error toast: "Tree Style Tab is not available. Please install or enable Tree Style Tab to use sorting features." Auto-dismiss after 7 seconds.

### TST API Error (Move/Attach Failure)
If TST returns an error during a `move` or `attach` operation (e.g., invalid tab ID, tab closed mid-sort):

**Response** (from TST):
```json
{
  "error": "Tab not found",
  "tabId": 456
}
```

**Handling**: Continue sorting remaining tabs — keep successfully sorted tabs in place. Display a partial-success warning toast: "Sorted X of Y tabs. Z tabs were unavailable." Auto-dismiss after 7 seconds. Log the full error details to the browser console.

### Permission Denied
If the addon lacks the necessary permissions to interact with TST:

**Handling**: Display a persistent error toast: "TST Tree Sorter does not have permission to interact with Tree Style Tab. Please check extension permissions." Auto-dismiss after 7 seconds.

