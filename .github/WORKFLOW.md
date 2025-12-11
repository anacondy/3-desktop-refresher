# GitHub Actions Workflow Documentation

## Overview

The automated build and release workflow has been configured to build the Retro Desktop Refresher application for multiple platforms and automatically publish releases.

## Workflow File

Location: `.github/workflows/build-and-release.yml`

## Triggers

The workflow runs automatically on:

1. **Push to main branch** - Builds all platforms but doesn't create a release
2. **Pull requests to main** - Builds all platforms to verify the PR
3. **Version tags (v*)** - Builds all platforms AND creates a GitHub release
4. **Manual dispatch** - Can be triggered manually from GitHub Actions tab

## Build Matrix

The workflow builds for 3 platforms simultaneously:

| Platform | OS | Outputs |
|----------|----|----|
| Windows | windows-latest | `.exe` (NSIS installer), `.exe` (portable), `.msi` |
| macOS | macos-latest | `.dmg`, `.zip` (Intel x64 + Apple M1/M2 ARM64) |
| Linux | ubuntu-latest | `.AppImage`, `.deb`, `.rpm` |

## Architecture Support

- **Windows**: x64 and ia32 (32-bit)
- **macOS**: x64 (Intel) and arm64 (Apple Silicon)
- **Linux**: x64

## Workflow Steps

### Build Job (runs for each platform)

1. **Checkout code** - Gets the repository code
2. **Setup Node.js** - Installs Node.js 20 with npm cache
3. **Install dependencies** - Runs `npm ci` to install exact versions
4. **Build application** - Runs `npm run build:win/mac/linux`
5. **Upload artifacts** - Saves build outputs for 7 days

### Release Job (only on version tags)

1. **Download artifacts** - Gets all platform builds
2. **Create GitHub Release** - Publishes a new release with:
   - All platform binaries
   - Auto-generated release notes
   - Version tag name

## How to Create a Release

To trigger an automated release:

```bash
# Tag the current commit with a version
git tag v1.0.0

# Push the tag to GitHub
git push origin v1.0.0
```

This will:
1. Trigger the workflow
2. Build for all platforms
3. Create a GitHub release at: `https://github.com/anacondy/3-desktop-refresher/releases/tag/v1.0.0`
4. Upload all binaries to the release

## Build Artifacts

When the workflow runs on a PR or main branch (without a tag), build artifacts are:
- Available in the GitHub Actions run page
- Retained for 7 days
- Can be downloaded for testing

## Build Configuration

All build settings are in `package.json` under the `build` key:

```json
{
  "build": {
    "appId": "com.anacondy.retro-refresher",
    "productName": "Retro Desktop Refresher",
    "win": { /* Windows settings */ },
    "mac": { /* macOS settings */ },
    "linux": { /* Linux settings */ }
  }
}
```

## Testing the Workflow

### On Pull Request
When you create a PR to main, the workflow will:
- Build all platforms
- Show status checks on the PR
- Allow you to download artifacts to test

### Manually
You can manually trigger the workflow:
1. Go to GitHub Actions tab
2. Select "Build and Release" workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Build Scripts

Available npm scripts:

```bash
npm run build        # Build for current platform
npm run build:win    # Build for Windows
npm run build:mac    # Build for macOS
npm run build:linux  # Build for Linux
npm run build:all    # Build for all platforms (local)
```

## Output Directory

All builds are created in the `dist/` directory, which is:
- Excluded from git via `.gitignore`
- Cleaned before each build
- Contains platform-specific subdirectories

## Security

- The workflow uses `GITHUB_TOKEN` for authentication
- Token has `contents: write` permission for creating releases
- No secrets need to be configured
- All dependencies are installed from `package-lock.json` for reproducibility

## Troubleshooting

### Build fails on a specific platform
- Check the GitHub Actions logs for that platform's job
- Verify the build works locally with `npm run build:<platform>`
- Ensure all dependencies are in `package.json`

### Release not created
- Verify you pushed a tag starting with `v` (e.g., `v1.0.0`)
- Check that the build jobs completed successfully
- Review the release job logs

### Artifacts not uploaded
- Check the artifact paths in the workflow match the build output
- Verify electron-builder is creating files in `dist/`
- Review the upload artifact step logs

## Monitoring

To monitor builds:
1. Go to GitHub Actions tab
2. View recent workflow runs
3. Click on a run to see:
   - Build status for each platform
   - Build logs
   - Downloadable artifacts
   - Time taken

## Future Enhancements

Potential improvements:
- Code signing for Windows and macOS
- Auto-update mechanism
- Deployment to package managers (Homebrew, Chocolatey, etc.)
- Automated testing before builds
- Build caching for faster builds
- Separate staging and production releases

---

Last Updated: December 7, 2024
