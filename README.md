<p align="center">
  <img width="150" height="150" alt="TubeTune Logo" src="https://github.com/user-attachments/assets/6d110600-7079-48f7-a4d4-427c65661ab0" />
</p>


# 🎶 TubeTune – YouTube & YouTube Music Default Quality Setter 🎥🎵

TubeTune is a lightweight **Chrome extension** that automatically sets your preferred **default video quality** on **YouTube** and **YouTube Music**.  
No more manually switching video quality every time – once you set it in the extension, TubeTune applies it consistently to all videos. 🚀

---

## ✨ Features

- 🎯 **Always play videos in your chosen quality** (e.g., 1080p, 720p, 480p).  
- 🎵 Works on both **YouTube** and **YouTube Music**.  
- ⚡ Simple and lightweight – no unnecessary permissions.  
- 🖱️ Easy-to-use popup menu for setting your preferred quality.  
- 🔄 Automatically applies settings to **every video** you play.  
- 🛡️ 100% free and open source.  

---

## 📸 Screenshots


---

## 🛠️ Installation

Since TubeTune isn’t yet on the Chrome Web Store, you can install it manually in **Developer Mode**:

1. **Download / Clone this repository**
   ```bash
   git clone https://github.com/ShubhmDalvi/TubeTune.git 
   ```
   or [download ZIP](https://github.com/ShubhmDalvi/TubeTune/archive/refs/heads/main.zip) and extract it.

2. **Open Extensions page in Chrome**
   - Go to `chrome://extensions/`  
   - Enable **Developer mode** (toggle in the top-right corner)

3. **Load the extension**
   - Click **Load unpacked**  
   - Select the `TubeTune` folder you just downloaded.  

4. 🎉 Done! TubeTune is now installed in your browser.  

---

## 🚀 Usage Guide

1. Click on the **TubeTune icon** in your browser toolbar.  
2. Select your preferred video quality from the popup (e.g., 1080p).  
3. Open YouTube or YouTube Music and play any video.  
4. TubeTune will **automatically set the video quality** to your chosen setting every time!  

> ✅ You only need to set it once – TubeTune remembers your preference.  

---

## 📂 Project Structure

```
TubeTune/
├── icons/              # Extension icons
├── manifest.json       # Chrome extension configuration
├── popup.html          # Popup UI
├── popup.js            # Popup logic (quality setting)
├── content.js          # Injected script for YouTube pages
├── page-script.js      # Handles quality enforcement
```

---

## 🔧 How It Works (Under the Hood)

- **popup.html / popup.js** → lets users choose their desired default quality.  
- **content.js** → injects logic into YouTube & YouTube Music pages.  
- **page-script.js** → detects video player events and enforces quality settings.  
- **manifest.json** → configures permissions and tells Chrome when to run scripts.  

---



## 🤝 Contributing

Contributions are welcome!  
Here’s how you can help:

1. Fork the repository  
2. Create a new branch (`feature/my-feature`)  
3. Commit your changes  
4. Push the branch  
5. Open a Pull Request 🎉  

---

## 📜 License

This project is licensed under the **MIT License** – you’re free to use, modify, and distribute it.  
See the [LICENSE](LICENSE) file for details.  

---

## 👨‍💻 Author

**[Shubham Dalvi](https://github.com/ShubhmDalvi)**  
- 🌐 GitHub: [@ShubhmDalvi](https://github.com/ShubhmDalvi)  

---

## 🚧 Roadmap / To-Do

- [ ] Publish on Chrome Web Store  
- [ ] Add more granular quality settings (e.g., auto vs exact match)  
- [ ] Support for other Chromium-based browsers (Edge, Brave, Opera)  
- [ ] Dark mode for popup UI  

---

## ⭐ Support

If you find TubeTune useful:  
- ⭐ Star this repo on GitHub  
- Share it with friends who love **YouTube & YouTube Music**  
- Open issues for feedback or feature requests  

---

> “Set your YouTube tune once, and enjoy it forever with TubeTune.” 🎶
<a href="https://www.flaticon.com/free-icons/video-quality" title="video quality icons">Extension Logo created by FACH - Flaticon</a>

<p align="center">
  <a href="#">
      <img src="https://api.visitorbadge.io/api/VisitorHit?user=ShubhmDalvi&repo=TubeTune&countColor=%237B1E7A" />
   </a>
</p>
 <a href="https://www.flaticon.com/free-icons/video-quality" title="video quality icons">Extension Logo created by FACH - Flaticon</a>
