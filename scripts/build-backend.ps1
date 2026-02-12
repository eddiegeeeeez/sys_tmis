# Backend Deployment Script for TradeMatrix
# This script builds the backend for production deployment

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "TradeMatrix Backend Build Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
$backendDir = "$PSScriptRoot\..\backend\TradeMatrix.Server"
Set-Location $backendDir

Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Clean previous builds
Write-Host "Step 1: Cleaning previous builds..." -ForegroundColor Green
if (Test-Path "./publish") {
    Remove-Item -Recurse -Force "./publish"
    Write-Host "  ✓ Removed old publish folder" -ForegroundColor Gray
}

# Restore dependencies
Write-Host ""
Write-Host "Step 2: Restoring dependencies..." -ForegroundColor Green
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to restore dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Dependencies restored" -ForegroundColor Gray

# Build the project
Write-Host ""
Write-Host "Step 3: Building project..." -ForegroundColor Green
dotnet build -c Release --no-restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Build successful" -ForegroundColor Gray

# Publish the project
Write-Host ""
Write-Host "Step 4: Publishing for production..." -ForegroundColor Green
dotnet publish -c Release -o ./publish --no-build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Publish failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Published to ./publish folder" -ForegroundColor Gray

# Display results
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Published files location:" -ForegroundColor Yellow
Write-Host "  $(Resolve-Path './publish')" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review appsettings.Production.json" -ForegroundColor White
Write-Host "  2. Update Frontend:ProductionUrl with your domain" -ForegroundColor White
Write-Host "  3. Upload ./publish/* to MonsterASP.NET via FTP" -ForegroundColor White
Write-Host "  4. Configure IIS Application Pool" -ForegroundColor White
Write-Host "  5. Test: https://yourdomain.com/api/Database/info" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
