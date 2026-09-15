# Ads Copy Fillup — Google Ads Asset Manager

[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Version](https://img.shields.io/badge/version-2.0-green.svg)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A lightweight, powerful Google Chrome Extension (Manifest V3) built for PPC specialists, media buyers, and digital agencies to **bulk fill, extract, and manage ad copy directly inside Google Ads** (Responsive Search Ads & Performance Max campaigns).

---

## 🚀 Features

- ⚡ **Bulk Autofill**: Insert all your headlines, long headlines, and descriptions into Google Ads in a single click.
- 🤖 **Auto-Field Expansion**: Automatically clicks Google Ads' *"Add Headline"* / *"Add Description"* buttons when more fields are needed.
- 📏 **Real-time Character Counter & Validation**:
  - **Headlines**: Max 30 characters (up to 15 headlines).
  - **Long Headlines**: Max 90 characters (up to 5 long headlines).
  - **Descriptions**: Max 90 characters (up to 5 descriptions).
  - Instant visual warnings for lines exceeding character thresholds.
- 📋 **Copy / Extract from Page**: Scrape and export live headlines and descriptions from existing ads directly to your clipboard or the extension.
- 🧹 **One-Click Clear**: Remove all existing copy from the form without tedious manual backspacing.
- 🔒 **100% Client-Side & Private**: Runs entirely in your browser. No analytics, no external tracking, no backend servers.

---

## 📥 Installation

### Load Unpacked in Google Chrome

1. **Clone or download this repository**:
   ```bash
   git clone https://github.com/alifmahmudashik/google-ads-copy-autofill.git
   ```
2. Open Google Chrome and navigate to:
   ```text
   chrome://extensions/
   ```
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** in the top-left menu.
5. Select the folder containing this extension (`manifest.json`).
6. Pin **Ads Copy Fillup** to your browser toolbar for quick access!

---

## 🎯 How to Use

1. Navigate to your Google Ads campaign and open a **Responsive Search Ad (RSA)** or **Performance Max** asset creation page (`https://ads.google.com/*`).
2. Click the **Ads Copy Fillup** extension icon.
3. Choose the tab you want to fill:
   - **Headlines** (30 char limit per line)
   - **Long** (90 char limit per line)
   - **Descriptions** (90 char limit per line)
4. Paste your prepared copy — **one item per line**.
5. Click **Fill [Asset Type]**. The extension will automatically add required fields and populate your text into Google Ads!
6. Need to grab copy from an ad already created? Click **Copy from Page** to pull them in instantly.

---

## 🛠️ Tech Stack

- **Platform:** Chrome Extensions API (Manifest V3)
- **Logic:** Vanilla JavaScript (`chrome.scripting`, `chrome.tabs`)
- **Styling:** Custom CSS with [DM Sans](https://fonts.google.com/specimen/DM+Sans) typography
- **Host Permissions:** Restricted strictly to `https://ads.google.com/*` for optimal security

---

## 👤 Author

Developed by **[Alif Mahmud](https://alifmahmud.com)**  
- Website: [alifmahmud.com](https://alifmahmud.com)
- GitHub: [@alifmahmudashik](https://github.com/alifmahmudashik)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
