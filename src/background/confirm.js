document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const count = urlParams.get('count');
  const isGlobal = urlParams.get('isGlobal') === 'true';

  const messageEl = document.getElementById('message');
  messageEl.style.whiteSpace = 'pre-wrap';
  if (isGlobal) {
    messageEl.textContent = `TST Tree Sorter: Are you sure you want to sort ALL top-level tabs? This will significantly rearrange your sidebar.`;
  } else {
    messageEl.textContent = `TST Tree Sorter: Are you sure you want to sort ${count} tabs?\nThis cannot be undone.`;
  }

  document.getElementById('confirm').addEventListener('click', () => {
    const disableConfirmation = document.getElementById('dont-show-again').checked;
    browser.runtime.sendMessage({
      action: 'confirm-sort',
      result: true,
      disableConfirmation: disableConfirmation
    });
    window.close();
  });

  document.getElementById('cancel').addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'confirm-sort', result: false });
    window.close();
  });
});
