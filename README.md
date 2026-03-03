# 🔍 Azure Tenant ID Finder

A lightweight Microsoft Edge extension that instantly looks up the **Azure AD / Entra ID Tenant ID** for any domain — no authentication or API key required.

![Extension screenshot](https://img.shields.io/badge/Edge-Extension-0078d4?style=flat&logo=microsoftedge&logoColor=white)
![Manifest Version](https://img.shields.io/badge/Manifest-v3-green?style=flat)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)

---

## ✨ Features

- 🔎 Look up the Tenant ID for any Microsoft 365 / Entra ID registered domain
- 📋 One-click copy to clipboard
- 🌐 Detects the Azure cloud environment (Public, US Government, Germany, China)
- ⚡ Auto-fills the domain from your currently active browser tab
- ❌ Clear, descriptive error messages for unregistered domains or network issues
- 🔒 No authentication, no API keys, no data collection — works entirely client-side

---

## 📦 Installation

### From Source (Developer Mode)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/azure-tenant-id-finder.git
   cd azure-tenant-id-finder
   ```

2. **Open Edge Extensions**
   Navigate to `edge://extensions/` in Microsoft Edge.

3. **Enable Developer Mode**
   Toggle **Developer mode** on in the top-right corner.

4. **Load the extension**
   Click **"Load unpacked"** and select the cloned repository folder.

5. **Pin it** *(optional)*
   Click the puzzle piece icon in the toolbar and pin **Azure Tenant ID Finder** for quick access.

---

## 🚀 Usage

1. Click the extension icon in the Edge toolbar.
2. Enter a domain name in the input field (e.g. `microsoft.com` or `contoso.onmicrosoft.com`).
3. Press **Enter** or click **Look Up**.
4. The Tenant ID and additional metadata will be displayed.
5. Use the **Copy ID** button to copy the GUID to your clipboard.

> **Tip:** When you open the extension while on a website, it automatically pre-fills the domain of your current tab.

---

## 🛠️ How It Works

The extension queries Microsoft's public **OpenID Connect discovery endpoint** — no credentials required:

```
GET https://login.microsoftonline.com/{domain}/.well-known/openid-configuration
```

The Tenant ID (a UUID) is extracted from the `issuer` field of the returned JSON:

```json
{
  "issuer": "https://sts.windows.net/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/",
  ...
}
```

This is a fully public endpoint documented by Microsoft and does not expose any sensitive tenant data.

---

## 📁 Project Structure

```
azure-tenant-id-finder/
├── manifest.json       # Extension manifest (Manifest V3)
├── popup.html          # Extension popup UI
├── popup.js            # Lookup logic and DOM interactions
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🌐 Supported Azure Clouds

| Cloud | Domain |
|---|---|
| Azure Public (Commercial) | `login.microsoftonline.com` |
| Azure US Government | `login.microsoftonline.us` |
| Azure Germany | `login.microsoftonline.de` |
| Azure China | `login.chinacloudapi.cn` |

---

## 🔒 Permissions

This extension requests minimal permissions:

| Permission | Reason |
|---|---|
| `host_permissions: login.microsoftonline.com` | Required to call the OpenID Connect endpoint and retrieve tenant metadata |

No tabs, browsing history, or personal data is ever accessed or stored.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please open an issue first to discuss any significant changes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- Uses the public [Microsoft OpenID Connect endpoint](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc) — no affiliation with Microsoft.
