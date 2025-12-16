# 3-Desktop-Refresher Wiki

Welcome to the wiki for **3-Desktop-Refresher**, a high-performance, cross-platform desktop refresher application optimized for 60+ FPS and high refresh rate displays.

## 📌 Quick Start

### Installation

#### From Source

1. **Clone the repository:**
   ```powershell
   git clone https://github.com/anacondy/3-desktop-refresher.git
   cd 3-desktop-refresher
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Run the application:**
   ```powershell
   npm start
   ```

#### Pre-Built Binaries

Download the latest release from the [Releases page](https://github.com/anacondy/3-desktop-refresher/releases).

### Usage

- Launch the application.
- Enjoy smooth animations and high refresh rate support.
- Use the settings menu to adjust particle effects and performance.

## 🛠️ Development

### Build from Source

```powershell
npm run build
```

### Run Tests

```powershell
npm test
```

### Create a Release

1. **Tag a new version:**
   ```powershell
   git tag v1.0.1
   git push origin v1.0.1
   ```

2. The GitHub Actions workflow will automatically build and release binaries for all platforms.

## 📊 Performance

| Device Type          | FPS (Avg) | Refresh Rate Support | Tested On          |
|----------------------|-----------|----------------------|---------------------|
| Low-End PC           | 60+       | 60Hz                 | Intel i3, 8GB RAM   |
| Mid-Range PC         | 120+      | 120Hz                | Intel i5, 16GB RAM  |
| High-End PC          | 144+      | 144Hz                | Intel i7, 32GB RAM  |
| macOS (Intel/ARM)    | 60+       | 60Hz+                | M1, Intel i7        |
| Linux (AppImage)     | 60+       | 60Hz+                | Ubuntu 22.04        |

## 💡 Notes

- **GitHub Pages:** The live demo is a static preview. For full functionality, run the application locally or use the pre-built binaries.
- **Electron App:** This application is designed to run as an Electron app on your desktop, not in the browser sandbox.
- **Copy-Paste Commands:** All commands above are ready to copy-paste into PowerShell or Command Prompt.