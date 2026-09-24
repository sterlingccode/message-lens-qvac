const message = document.querySelector('#message');
const analyze = document.querySelector('#analyze');
const results = document.querySelector('#results');
const status = document.querySelector('#status');
const demo = document.querySelector('#demo');
const copy = document.querySelector('#copy');

const demoText = 'Hey! Can you send me the final report before 4 PM today? I need to add the numbers to the presentation tonight. Thanks!';

demo.addEventListener('click', () => {
  message.value = demoText;
  message.focus();
});

analyze.addEventListener('click', async () => {
  const text = message.value.trim();
  if (!text) {
    status.textContent = 'Paste a message first.';
    message.focus();
    return;
  }

  analyze.disabled = true;
  status.textContent = 'Running QVAC locally…';
  results.classList.add('hidden');

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Analysis failed.');

    document.querySelector('#intent').textContent = data.intent || '—';
    document.querySelector('#urgency').textContent = data.urgency || '—';
    document.querySelector('#tone').textContent = data.tone || '—';
    document.querySelector('#summary').textContent = data.summary || '—';
    document.querySelector('#reply').textContent = data.reply || '—';
    results.classList.remove('hidden');
    status.textContent = 'Done — inference ran locally through QVAC.';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    analyze.disabled = false;
  }
});

copy.addEventListener('click', async () => {
  const text = document.querySelector('#reply').textContent;
  try {
    await navigator.clipboard.writeText(text);
    copy.textContent = 'Copied!';
    setTimeout(() => { copy.textContent = 'Copy'; }, 1200);
  } catch {
    copy.textContent = 'Copy failed';
  }
});
