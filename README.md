<p align="center">
  <img width="150" height="150" alt="TubeTune Logo" src="https://github.com/user-attachments/assets/6d110600-7079-48f7-a4d4-427c65661ab0" />
</p>

# TubeTune – YouTube & YouTube Music Default Quality Setter

TubeTune is a lightweight Chrome extension that automatically sets your preferred video quality on YouTube and YouTube Music.

Instead of manually changing the quality for every video, simply choose your preferred resolution once and TubeTune will automatically apply it whenever possible.

## Features

- Automatically applies your preferred video quality
- Works with both YouTube and YouTube Music
- Lightweight with minimal permissions
- Simple popup interface for selecting your preferred quality
- Applies your settings across all supported videos
- Free and open source


## Installation

TubeTune is not yet available on the Chrome Web Store. You can install it manually using Developer Mode.

### 1. Download or clone the repository

```bash
git clone https://github.com/ShubhmDalvi/TubeTune.git
```

Or download the repository as a ZIP file and extract it.

### 2. Open the Chrome Extensions page

Go to:

```
chrome://extensions/
```

Enable **Developer mode** using the toggle in the top-right corner.

### 3. Load the extension

- Click **Load unpacked**
- Select the extracted `TubeTune` folder

The extension is now installed and ready to use.

## Usage

1. Click the TubeTune extension icon.
2. Select your preferred video quality.
3. Open YouTube or YouTube Music.
4. Play any video.

TubeTune will automatically apply your selected quality whenever supported.

## Project Structure

```text
TubeTune/
├── icons/              # Extension icons
├── manifest.json       # Extension configuration
├── popup.html          # Popup interface
├── popup.js            # Popup logic
├── content.js          # Content script
├── page-script.js      # Video quality handling
```

## How It Works

- **popup.html** and **popup.js** provide the interface for selecting the preferred quality.
- **content.js** injects the required logic into YouTube and YouTube Music pages.
- **page-script.js** monitors the player and applies the configured quality.
- **manifest.json** defines permissions and script injection rules.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

<p align="center">
  <a href="#">
      <img src="https://api.visitorbadge.io/api/VisitorHit?user=ShubhmDalvi&repo=TubeTune&countColor=%237B1E7A" />
   </a>
</p>
