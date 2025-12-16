# 3-Desktop-Refresher

A high-performance, cross-platform desktop refresher application optimized for 60+ FPS and high refresh rate displays.

![GitHub release (latest by date)](https://img.shields.io/github/v/release/anacondy/3-desktop-refresher?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/anacondy/3-desktop-refresher/build-and-release.yml?style=for-the-badge)
![GitHub License](https://img.shields.io/github/license/anacondy/3-desktop-refresher?style=for-the-badge)

## 📌 Features

- **60+ FPS Performance:** Optimized for smooth animations on all devices.
- **High Refresh Rate Support:** Auto-syncs to display refresh rate (120Hz, 144Hz+).
- **Cross-Platform:** Windows, macOS, and Linux builds.
- **GPU Acceleration:** Uses `transform: translateZ(0)` and `will-change` for smooth rendering.
- **Adaptive Particle Effects:** Adjusts based on device capability.
- **Automated CI/CD:** GitHub Actions for builds, releases, and deployments.

## 📦 Installation

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/anacondy/3-desktop-refresher.git
   cd 3-desktop-refresher
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

### Pre-Built Binaries

Download the latest release from the [Releases page](https://github.com/anacondy/3-desktop-refresher/releases).

## 🚀 Usage

- Launch the application.
- Enjoy smooth animations and high refresh rate support.
- Use the settings menu to adjust particle effects and performance.

## 🛠️ Development

### Build from Source

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Create a Release

1. Tag a new version:
   ```bash
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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Live Demo

Check out the live demo on GitHub Pages: [3-Desktop-Refresher Live Demo](https://anacondy.github.io/3-desktop-refresher/)

## 📝 Wiki

For more details, check out the [Wiki](https://github.com/anacondy/3-desktop-refresher/wiki).