Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Retro Desktop Refresher..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$RepoUrl = "https://github.com/anacondy/3-desktop-refresher.git"
$TempDir = "$env:TEMP\RetroDesktopRefresher"

if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed. Please install Git first." -ForegroundColor Red
    exit
}
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js (npm) is not installed. Please install Node.js first." -ForegroundColor Red
    exit
}

if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}

Write-Host "Downloading latest version from GitHub..." -ForegroundColor Yellow
git clone --quiet $RepoUrl $TempDir
Set-Location $TempDir

Write-Host "Installing required dependencies..." -ForegroundColor Yellow
npm install --silent

Write-Host "Launching Application!" -ForegroundColor Green
npm start