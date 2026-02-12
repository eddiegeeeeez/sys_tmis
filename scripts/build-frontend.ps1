# Frontend Deployment Script for TradeMatrix
# This script builds the frontend for production deployment

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "TradeMatrix Frontend Build Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Change to frontend directory
$frontendDir = "$PSScriptRoot\..\frontend"
Set-Location $frontendDir

Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "⚠ Warning: .env.production not found!" -ForegroundColor Yellow
    Write-Host "  Using default configuration" -ForegroundColor Gray
} else {
    Write-Host "✓ Found .env.production" -ForegroundColor Green
}

# Ask user for deployment type
Write-Host ""
Write-Host "Select deployment type:" -ForegroundColor Yellow
Write-Host "  1. Static Export (Recommended for MonsterASP.NET)" -ForegroundColor White
Write-Host "  2. Standard Build (Requires Node.js on server)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Selected: Static Export" -ForegroundColor Green
    
    # Update next.config.ts for static export
    Write-Host ""
    Write-Host "Step 1: Configuring for static export..." -ForegroundColor Green
    
    $configPath = "./next.config.ts"
    $configContent = Get-Content $configPath -Raw
    
    # Uncomment static export lines
    $configContent = $configContent -replace '// output:', 'output:'
    $configContent = $configContent -replace '// images:', 'images:'
    $configContent = $configContent -replace '//   unoptimized:', '  unoptimized:'
    $configContent = $configContent -replace '// }', '}'
    
    Set-Content $configPath $configContent
    Write-Host "  ✓ Configured for static export" -ForegroundColor Gray
}

# Install dependencies
Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Green
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Dependencies installed" -ForegroundColor Gray

# Build the project
Write-Host ""
Write-Host "Step 3: Building project..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Build successful" -ForegroundColor Gray

# Display results
Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

if ($choice -eq "1") {
    Write-Host "Built files location:" -ForegroundColor Yellow
    Write-Host "  $(Resolve-Path './out')" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Upload ./out/* to MonsterASP.NET wwwroot via FTP" -ForegroundColor White
    Write-Host "  2. Ensure index.html is in root directory" -ForegroundColor White
    Write-Host "  3. Test: https://yourdomain.com" -ForegroundColor White
} else {
    Write-Host "Built files location:" -ForegroundColor Yellow
    Write-Host "  $(Resolve-Path './.next')" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Upload entire frontend folder to MonsterASP.NET via FTP" -ForegroundColor White
    Write-Host "  2. SSH into server and run: npm start" -ForegroundColor White
    Write-Host "  3. Configure reverse proxy in IIS" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
