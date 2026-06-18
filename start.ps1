$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root "jkbbiu\backend"
$frontendPath = Join-Path $root "jkbbiu\frontend"

Write-Host "Market Otomasyonu baslatiliyor..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendPath'; Write-Host 'Backend: http://localhost:8001' -ForegroundColor Green; dotnet run"
)

Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontendPath'; Write-Host 'Frontend: http://localhost:3000' -ForegroundColor Green; npm run dev"
)

Write-Host ""
Write-Host "Iki terminal acildi." -ForegroundColor Yellow
Write-Host "Tarayicida acin: http://localhost:3000" -ForegroundColor Green
Write-Host "Giris: admin / Admin123!" -ForegroundColor Green
