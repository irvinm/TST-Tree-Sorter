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

  // Save on change
  disableConfirmCheck.addEventListener('change', async () => {
    await StorageService.updateSettings({ disableConfirmation: disableConfirmCheck.checked });
  });

  disableGlobalCheck.addEventListener('change', async () => {
    await StorageService.updateSettings({ disableGlobalConfirmation: disableGlobalCheck.checked });
  });

  notifyCheck.addEventListener('change', async () => {
    await StorageService.updateSettings({ disableNotifications: notifyCheck.checked });
  });

  durationInput.addEventListener('change', async () => {
    await StorageService.updateSettings({ toastDuration: parseInt(durationInput.value, 10) });
  });

  optionsBtn.addEventListener('click', () => {
    browser.runtime.openOptionsPage();
  });
});
