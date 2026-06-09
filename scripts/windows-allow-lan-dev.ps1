# Opens Windows Firewall for local dev (Vite 5173 + API 5000) on Private networks.
# Right-click PowerShell -> Run as administrator, then:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
#   & "C:\path\to\E-comerance women brand\scripts\windows-allow-lan-dev.ps1"

$ErrorActionPreference = "Stop"

function Add-RuleIfMissing {
  param([string]$DisplayName, [int]$Port)
  $existing = Get-NetFirewallRule -DisplayName $DisplayName -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "Rule already exists: $DisplayName"
    return
  }
  New-NetFirewallRule `
    -DisplayName $DisplayName `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort $Port `
    -Profile Private, Domain, Public `
    | Out-Null
  Write-Host "Created rule: $DisplayName (port $Port, all profiles - dev only; remove rules when not needed)"
}

try {
  Add-RuleIfMissing -DisplayName "E-com dev Vite (5173)" -Port 5173
  Add-RuleIfMissing -DisplayName "E-com dev API (5000)" -Port 5000
  Write-Host ""
  Write-Host "Done. On your phone use: http://<this-PC-IPv4>:5173/"
  Write-Host "Find IPv4: ipconfig (Wireless LAN adapter Wi-Fi -> IPv4 Address)"
  Write-Host "If it still fails: Wi-Fi -> Properties -> set Network profile to Private (not Public)."
} catch {
  Write-Host "FAILED (usually need Administrator): $($_.Exception.Message)"
  exit 1
}
