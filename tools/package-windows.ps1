$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$exe = Join-Path $root "backend\target\release\paciencia-backend.exe"
$stage = Join-Path $root "dist\Paciencia95"
$zip = Join-Path $root "dist\Paciencia95-windows-x64.zip"

if (-not (Test-Path -LiteralPath $exe)) {
    throw "Binário release não encontrado. Execute 'npm run build' antes de empacotar."
}

if (Test-Path -LiteralPath $stage) {
    Remove-Item -LiteralPath $stage -Recurse -Force
}
New-Item -ItemType Directory -Path $stage -Force | Out-Null

Copy-Item -LiteralPath $exe -Destination (Join-Path $stage "Paciencia95.exe")
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "LEIA-ME-distribuicao.txt") `
    -Destination (Join-Path $stage "LEIA-ME.txt")

# O marcador ativa o modo portátil: o SQLite fica em .\dados ao lado do exe.
Set-Content -LiteralPath (Join-Path $stage "portatil.txt") `
    -Value "Modo portatil do Paciencia 95. Os dados ficam na pasta 'dados'." `
    -Encoding ASCII

if (Test-Path -LiteralPath $zip) {
    Remove-Item -LiteralPath $zip -Force
}

Compress-Archive -LiteralPath $stage -DestinationPath $zip -CompressionLevel Optimal

$size = [math]::Round((Get-Item -LiteralPath $zip).Length / 1MB, 1)
Write-Host ""
Write-Host "Distribuição Windows gerada:"
Write-Host "  Pasta: $stage"
Write-Host "  Zip:   $zip ($size MB)"
Write-Host ""
Write-Host "Extraia o zip e execute Paciencia95.exe."
