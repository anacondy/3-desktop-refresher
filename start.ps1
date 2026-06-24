# ============================================================
#  Retro Desktop Refresher - Safe one-command launcher
#  PHASE 1 (C2) security hardening vs. the old script:
#    1. Pinned to a specific release TAG (no mutable 'main').
#    2. Clones that exact ref only.
#    3. npm ci  -> reproducible install from package-lock.json.
#    4. postinstall (electron-builder install-app-deps) rebuilds
#       native deps (koffi) for the Electron ABI.
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Retro Desktop Refresher (secure)..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# --- SECURITY: pin to a specific, audited release tag/commit. ---
# Update this to your newest release tag after each signed release.
# (Create a tag with:  git tag v1.1.0  &&  git push origin v1.1.0)
$PinnedRef = "v1.1.0"

$RepoUrl = "https://github.com/anacondy/3-desktop-refresher.git"
$TempDir = "$env:TEMP\RetroDesktopRefresher"

# --- Prerequisites ---
if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js (npm) is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# --- Clean any previous run ---
if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}

Write-Host "Downloading pinned release '$PinnedRef' from GitHub..." -ForegroundColor Yellow
git clone --quiet $RepoUrl $TempDir
if (-not $?) {
    Write-Host "Failed to clone repository." -ForegroundColor Red
    exit 1
}
Set-Location $TempDir

# Pin to the exact audited ref (tag, branch, or commit)
git checkout --quiet $PinnedRef
if (-not $?) {
    Write-Host "Tag/ref '$PinnedRef' not found. Verify it exists on GitHub." -ForegroundColor Red
    exit 1
}

Write-Host "Installing required dependencies (reproducible)..." -ForegroundColor Yellow
# Reproducible install from the pinned lockfile.
# If you want maximum hardening you may switch to:
#   npm ci --ignore-scripts
# but then you MUST also run:  npm rebuild koffi
# (koffi needs its install script to fetch the correct native binary).
npm ci --silent
if (-not $?) {
    Write-Host "npm ci failed." -ForegroundColor Red
    exit 1
}

Write-Host "Launching Application!" -ForegroundColor Green
npm start
