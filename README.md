# Ads Copy Fillup — Google Ads Asset Manager

[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Version](https://img.shields.io/badge/version-2.1-green.svg)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A lightweight, powerful Google Chrome Extension (Manifest V3) built for PPC specialists, media buyers, and digital agencies to **bulk fill, extract, and manage ad copy directly inside Google Ads** (Responsive Search Ads & Performance Max campaigns).

---

## 🚀 Features

- 📥 **Quick Paste to Page (All-in-One Auto-Fill)**: Reads your prepared ad copy directly from the clipboard, detects whether the active page has Long Headline inputs (Display/PMax) or is standard RSA, intelligently maps the lines (15 headlines, 5 long headlines, 4/5 descriptions), populates all tabs, and auto-fills the entire Google Ads form in one click!
- 📋 **Quick Copy All (All-in-One)**: Scrapes all live headlines, long headlines, and descriptions directly from Google Ads into your clipboard and fills all extension tabs simultaneously in a single click.
- ⚡ **Bulk Autofill**: Insert all your headlines, long headlines, and descriptions into Google Ads in a single click.
- 🤖 **Auto-Field Expansion**: Automatically clicks Google Ads' *"Add Headline"* / *"Add Description"* buttons when more fields are needed.
- 📏 **Real-time Character Counter & Validation**:
  - **Headlines**: Max 30 characters (up to 15 headlines).
  - **Long Headlines**: Max 90 characters (up to 5 long headlines).
  - **Descriptions**: Max 90 characters (up to 5 descriptions).
  - Instant visual warnings for lines exceeding character thresholds.
- 📋 **Copy / Extract from Page**: Scrape and export live headlines and descriptions tab-by-tab or all at once directly to your clipboard or the extension.
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
3. **Quick Paste & Fill (Recommended)**:
   - Copy your entire ad copy block to your clipboard (e.g. from Google Docs, Excel, or chat).
   - Click **Quick Paste to Page**. The extension automatically checks if Long Headlines inputs exist on the page:
     - **With Long Headlines** (Responsive Display / PMax): Fills first 15 lines as Headlines, next 5 as Long Headlines, and next as Descriptions.
     - **Without Long Headlines** (RSA): Fills first 15 lines as Headlines, and 4 lines as Descriptions.
     - Auto-expands fields and populates the Google Ads form and all extension tabs instantly!
4. **Manual Tab Filling**:
   - Choose the tab you want to fill (**Headlines**, **Long**, or **Descriptions**).
   - Paste your prepared copy — **one item per line**.
   - Click **Fill [Asset Type]**.
5. **Quick Copy All**:
   - Click **Copy All from Page** to extract all headlines, long headlines, and descriptions directly from the active Google Ads page into your clipboard and the extension's text boxes.

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
