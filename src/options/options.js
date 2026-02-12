document.addEventListener('DOMContentLoaded', async () => {
  const settings = await StorageService.getSettings();

  const els = {
    disableConfirmation: document.getElementById('disableConfirmation'),
    disableGlobalConfirmation: document.getElementById('disableGlobalConfirmation'),
    disableNotifications: document.getElementById('disableNotifications'),
    confirmThreshold: document.getElementById('confirmThreshold'),
    toastDuration: document.getElementById('toastDuration'),
    strictDomainSort: document.getElementById('strictDomainSort'),
    emptyDomainTop: document.getElementById('emptyDomainTop'),
    status: document.getElementById('status')
  };

  // Load
  els.disableConfirmation.checked = settings.disableConfirmation;
  els.disableGlobalConfirmation.checked = settings.disableGlobalConfirmation;
  els.disableNotifications.checked = settings.disableNotifications;
  els.confirmThreshold.value = settings.confirmThreshold;
  els.toastDuration.value = settings.toastDuration;
  els.strictDomainSort.checked = settings.strictDomainSort;
  els.emptyDomainTop.checked = settings.emptyDomainTop;

  // Save logic
  const save = async () => {
    await StorageService.updateSettings({
      disableConfirmation: els.disableConfirmation.checked,
      disableGlobalConfirmation: els.disableGlobalConfirmation.checked,
      disableNotifications: els.disableNotifications.checked,
      confirmThreshold: parseInt(els.confirmThreshold.value, 10),
      toastDuration: parseInt(els.toastDuration.value, 10),
      strictDomainSort: els.strictDomainSort.checked,
      emptyDomainTop: els.emptyDomainTop.checked
    });

    els.status.textContent = 'Saved!';
    setTimeout(() => els.status.textContent = '', 1500);
  };

  // Listeners
  Object.values(els).forEach(el => {
    if (el && el.tagName === 'INPUT') {
      el.addEventListener('change', save);
    }
  });
});
