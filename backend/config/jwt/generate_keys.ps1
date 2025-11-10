# PowerShell script to generate JWT keys using .NET
$passphrase = "4099fdcb4c938dfdeeb60bc1c1292412a3e6654cb52b4d35afe92b4e8024cf99"
$jwtDir = "$PSScriptRoot"

# Try to use OpenSSL if available via Git or WSL
$opensslPath = $null

# Check Git Bash
$gitBash = "C:\Program Files\Git\bin\openssl.exe"
if (Test-Path $gitBash) {
    $opensslPath = $gitBash
}

# Check WSL
if ($null -eq $opensslPath) {
    try {
        $wslTest = wsl which openssl 2>&1
        if ($LASTEXITCODE -eq 0) {
            $opensslPath = "wsl"
        }
    } catch {}
}

if ($opensslPath) {
    Write-Host "Generating JWT keys using OpenSSL..."
    
    if ($opensslPath -eq "wsl") {
        # Use WSL
        wsl bash -c "openssl genpkey -out '$jwtDir/private.pem' -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:$passphrase"
        wsl bash -c "openssl rsa -pubout -in '$jwtDir/private.pem' -out '$jwtDir/public.pem' -passin pass:$passphrase"
    } else {
        # Use Git Bash OpenSSL
        & $opensslPath genpkey -out "$jwtDir\private.pem" -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:$passphrase
        & $opensslPath rsa -pubout -in "$jwtDir\private.pem" -out "$jwtDir\public.pem" -passin pass:$passphrase
    }
    
    Write-Host "Keys generated successfully!"
} else {
    Write-Host "OpenSSL not found. Please install Git for Windows or use WSL."
    Write-Host "Alternative: Use online generator at https://mkjwk.org/ or https://token.dev/"
    Write-Host "Generate RSA 4096-bit keys with passphrase: $passphrase"
}

