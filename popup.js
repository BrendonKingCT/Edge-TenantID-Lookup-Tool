const domainInput = document.getElementById('domainInput');
const lookupBtn = document.getElementById('lookupBtn');
const btnText = document.getElementById('btnText');
const spinner = document.getElementById('spinner');
const resultCard = document.getElementById('resultCard');
const resultHeader = document.getElementById('resultHeader');
const resultBody = document.getElementById('resultBody');

// Clean a user-entered value to extract just the domain
function cleanDomain(value) {
  value = value.trim();
  // Remove protocol
  value = value.replace(/^https?:\/\//i, '');
  // Remove path, query, hash
  value = value.split('/')[0].split('?')[0].split('#')[0];
  // Remove port
  value = value.split(':')[0];
  return value.toLowerCase();
}

function showResult(type, headerText, bodyHtml) {
  resultCard.className = `result-card visible ${type}`;
  resultHeader.innerHTML = headerText;
  resultBody.innerHTML = bodyHtml;
}

async function lookupTenant(domain) {
  const url = `https://login.microsoftonline.com/${domain}/.well-known/openid-configuration`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Extract tenant ID from the issuer URL
  // Format: https://sts.windows.net/{tenantId}/
  const issuer = data.issuer || '';
  const tokenEndpoint = data.token_endpoint || '';

  // Try issuer first
  let tenantId = null;
  const issuerMatch = issuer.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\//i);
  if (issuerMatch) {
    tenantId = issuerMatch[1];
  } else {
    // Fallback to token_endpoint
    const tokenMatch = tokenEndpoint.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\//i);
    if (tokenMatch) tenantId = tokenMatch[1];
  }

  if (!tenantId) {
    throw new Error('Tenant ID not found in the OpenID configuration response.');
  }

  return { tenantId, issuer, tokenEndpoint };
}

async function handleLookup() {
  const raw = domainInput.value;
  const domain = cleanDomain(raw);

  if (!domain) {
    domainInput.focus();
    return;
  }

  // Basic domain validation
  if (!/^[a-z0-9]([a-z0-9\-\.]{0,253}[a-z0-9])?$/i.test(domain)) {
    showResult('error',
      '❌ &nbsp;Invalid Domain',
      `<p class="error-msg">Please enter a valid domain name (e.g. <strong>contoso.com</strong>).</p>`
    );
    return;
  }

  // Show loading state
  btnText.textContent = 'Looking up…';
  spinner.classList.add('active');
  lookupBtn.disabled = true;
  resultCard.className = 'result-card';

  try {
    const { tenantId, issuer, tokenEndpoint } = await lookupTenant(domain);

    // Derive cloud from issuer
    let cloud = 'Azure Public (Commercial)';
    if (issuer.includes('microsoftonline.us')) cloud = 'Azure US Government';
    else if (issuer.includes('microsoftonline.de')) cloud = 'Azure Germany';
    else if (issuer.includes('chinacloudapi.cn') || issuer.includes('partner.microsoftonline.cn')) cloud = 'Azure China';

    showResult('success',
      '✅ &nbsp;Tenant Found',
      `
      <p class="result-label">Tenant ID</p>
      <p class="tenant-id" id="tenantIdText">${tenantId}</p>
      <div class="copy-row">
        <button class="copy-btn" id="copyBtn">
          📋 Copy ID
        </button>
      </div>
      <div class="meta-row">
        <div class="meta-item">
          <span>Domain</span>
          <span>${domain}</span>
        </div>
        <div class="meta-item">
          <span>Cloud</span>
          <span>${cloud}</span>
        </div>
        <div class="meta-item">
          <span>Issuer</span>
          <span title="${issuer}">${issuer}</span>
        </div>
      </div>
      `
    );

    // Wire up copy button
    document.getElementById('copyBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(tenantId).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '📋 Copy ID';
          btn.classList.remove('copied');
        }, 2000);
      });
    });

  } catch (err) {
    let message = err.message;

    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      message = 'Network error. Check your internet connection.';
    } else if (message.includes('404') || message.includes('400')) {
      message = `No Azure AD / Entra ID tenant found for <strong>${domain}</strong>. This domain may not be registered with Microsoft.`;
    }

    showResult('error',
      '❌ &nbsp;Lookup Failed',
      `<p class="error-msg">${message}</p>`
    );
  } finally {
    btnText.textContent = 'Look Up';
    spinner.classList.remove('active');
    lookupBtn.disabled = false;
  }
}

// Event listeners
lookupBtn.addEventListener('click', handleLookup);

domainInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLookup();
});

// Auto-focus
domainInput.focus();

// Pre-fill with current tab's domain if possible
if (typeof chrome !== 'undefined' && chrome.tabs) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        if (url.hostname && !url.hostname.startsWith('chrome') && !url.hostname.startsWith('edge')) {
          domainInput.value = url.hostname;
        }
      } catch (_) {}
    }
  });
}
