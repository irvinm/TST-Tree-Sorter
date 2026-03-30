document.addEventListener('DOMContentLoaded', async () => {
  const settings = await StorageService.getSettings();

  const disableConfirmCheck = document.getElementById('disableConfirmation');
  const disableGlobalCheck = document.getElementById('disableGlobalConfirmation');
  const notifyCheck = document.getElementById('disableNotifications');
  const durationInput = document.getElementById('toastDuration');
  const optionsBtn = document.getElementById('openOptions');

  // Load initial values
  disableConfirmCheck.checked = settings.disableConfirmation;
  disableGlobalCheck.checked = settings.disableGlobalConfirmation;
  notifyCheck.checked = settings.disableNotifications;
  durationInput.value = settings.toastDuration;

  // Disable toast duration when notifications are disabled (FR-023, Session 2026-03-29)
  durationInput.disabled = settings.disableNotifications;

  // Save on change
  disableConfirmCheck.addEventListener('change', async () => {
    await StorageService.updateSettings({ disableConfirmation: disableConfirmCheck.checked });
  });

  disableGlobalCheck.addEventListener('change', async () => {
    await StorageService.updateSettings({ disableGlobalConfirmation: disableGlobalCheck.checked });
  });

  notifyCheck.addEventListener('change', async () => {
    await StorageService.updateSettings({ disableNotifications: notifyCheck.checked });
    // Toggle toast duration field (FR-023, Session 2026-03-29)
    durationInput.disabled = notifyCheck.checked;
  });

  durationInput.addEventListener('change', async () => {
    await StorageService.updateSettings({ toastDuration: parseInt(durationInput.value, 10) });
  });

  optionsBtn.addEventListener('click', () => {
    browser.runtime.openOptionsPage();
  });
});
