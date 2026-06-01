Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Retro Desktop Refresher..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$RepoUrl = "https://github.com/anacondy/3-desktop-refresher.git"
$TempDir = "$env:TEMP\RetroDesktopRefresher"
$RepoRef = if ($env:RETRO_REFRESHER_REF) { $env:RETRO_REFRESHER_REF.Trim() } else { "" }

function Test-RepoRef {
    param(
        [string]$Ref
    )
    if ($Ref -match '^[0-9a-fA-F]{7,40}$') {
        return $true
    }

    if ($Ref.StartsWith("-")) {
        return $false
    }

    if ($Ref -notmatch '^[A-Za-z0-9._/-]+$') {
        return $false
    }

    if ($Ref -match '\.\.' -or $Ref -match '@{' -or $Ref -match '\\' -or $Ref -match '//' -or $Ref -match '^/' -or $Ref -match '/$') {
        return $false
    }

    return $true
}

if ($RepoRef -and -not (Test-RepoRef -Ref $RepoRef)) {
    Write-Host "Invalid version reference supplied. Use a commit hash, tag, or branch name." -ForegroundColor Red
    exit 1
}

# Define minimum required versions
$MinGitVersion = [System.Version]"2.20.0"
$MinNodeVersion = [System.Version]"14.0.0"
$MinNpmVersion = [System.Version]"6.0.0"

# Function to check version
function Check-Version {
    param(
        [string]$Command,
        [string]$VersionFlag = "--version"
    )
    
    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        return $null
    }
    
    try {
        $versionOutput = & $Command $VersionFlag 2>&1
        # Extract version number - handles formats like "git version 2.30.0.windows.1" or "v14.0.0-rc.1" or "14" or "2.0"
        # Captures up to three numeric segments (major.minor.patch)
        if ($versionOutput -match '(\d+)(?:\.(\d+))?(?:\.(\d+))?') {
            $major = $matches[1]
            $minor = if ($matches[2]) { $matches[2] } else { "0" }
            $patch = if ($matches[3]) { $matches[3] } else { "0" }
            $version = "$major.$minor.$patch"
            return [System.Version]$version
        }
        return $null
    }
    catch {
        return $null
    }
}

# Function to check and install dependencies
function Verify-Dependencies {
    Write-Host "`nVerifying dependencies..." -ForegroundColor Yellow
    $allOk = $true
    
    # Check Git
    Write-Host "Checking Git..." -ForegroundColor Cyan
    $gitVersion = Check-Version -Command "git"
    
    if ($null -eq $gitVersion) {
        Write-Host "  ❌ Git is not installed or version cannot be determined." -ForegroundColor Red
        Write-Host "  📥 Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
        $allOk = $false
    }
    elseif ($gitVersion -lt $MinGitVersion) {
        Write-Host "  ⚠️  Git version $gitVersion found, but $MinGitVersion or higher is required." -ForegroundColor Yellow
        $allOk = $false
    }
    else {
        Write-Host "  ✓ Git version $gitVersion (OK)" -ForegroundColor Green
    }
    
    # Check Node.js (node command)
    Write-Host "Checking Node.js..." -ForegroundColor Cyan
    $nodeVersion = Check-Version -Command "node"
    
    if ($null -eq $nodeVersion) {
        Write-Host "  ❌ Node.js is not installed or version cannot be determined." -ForegroundColor Red
        Write-Host "  📥 Please install Node.js from: https://nodejs.org/ (LTS recommended)" -ForegroundColor Yellow
        $allOk = $false
    }
    elseif ($nodeVersion -lt $MinNodeVersion) {
        Write-Host "  ⚠️  Node.js version $nodeVersion found, but $MinNodeVersion or higher is required." -ForegroundColor Yellow
        $allOk = $false
    }
    else {
        Write-Host "  ✓ Node.js version $nodeVersion (OK)" -ForegroundColor Green
    }
    
    # Check npm
    Write-Host "Checking npm..." -ForegroundColor Cyan
    $npmVersion = Check-Version -Command "npm"
    
    if ($null -eq $npmVersion) {
        Write-Host "  ❌ npm is not installed or version cannot be determined." -ForegroundColor Red
        Write-Host "  💡 npm comes with Node.js. Please reinstall Node.js from: https://nodejs.org/" -ForegroundColor Yellow
        $allOk = $false
    }
    elseif ($npmVersion -lt $MinNpmVersion) {
        Write-Host "  ⚠️  npm version $npmVersion found, but $MinNpmVersion or higher is required." -ForegroundColor Yellow
        Write-Host "  💡 Try updating npm with: npm install -g npm@lts" -ForegroundColor Yellow
        $allOk = $false
    }
    else {
        Write-Host "  ✓ npm version $npmVersion (OK)" -ForegroundColor Green
    }
    
    return $allOk
}

# Verify all dependencies
if (-not (Verify-Dependencies)) {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "Dependencies are not properly configured!" -ForegroundColor Red
    Write-Host "Please install the missing or outdated tools above." -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ All dependencies verified successfully!" -ForegroundColor Green

if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}

Write-Host "`nDownloading latest version from GitHub..." -ForegroundColor Yellow
git clone --quiet $RepoUrl $TempDir
Set-Location $TempDir

if ($RepoRef) {
    Write-Host "Switching to version $RepoRef..." -ForegroundColor Yellow
    git checkout --quiet $RepoRef
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Unable to checkout version $RepoRef." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Installing required npm packages..." -ForegroundColor Yellow
npm install --silent

Write-Host "Launching Application!" -ForegroundColor Green
npm start