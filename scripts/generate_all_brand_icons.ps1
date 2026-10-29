Add-Type -AssemblyName System.Drawing

$projectRoot = Resolve-Path "$PSScriptRoot/.."
$logoPath = Join-Path $projectRoot "public\assets\logo.png"
$publicDir = Join-Path $projectRoot "public"

if (-not (Test-Path $logoPath)) {
    Write-Error "Logo not found at $logoPath"
    exit 1
}

$logo = [System.Drawing.Bitmap]::FromFile($logoPath)
Write-Output "Loaded logo: $($logo.Width) x $($logo.Height)"

# Function to render logo onto white square
function CreateBrandedSquare($size, $scaleRatio) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Clean, crisp white background so dark text and clock never disappear
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.FillRectangle($brush, 0, 0, $size, $size)
    $brush.Dispose()
    
    $targetW = [int]($size * $scaleRatio)
    $targetH = [int]($targetW * $logo.Height / $logo.Width)
    $targetX = [int](($size - $targetW) / 2)
    $targetY = [int](($size - $targetH) / 2)
    
    $g.DrawImage($logo, $targetX, $targetY, $targetW, $targetH)
    $g.Dispose()
    return $bmp
}

# 1. apple-touch-icon.png (180x180, scale 0.82 for perfect iOS squircle safe area)
$appleIcon = CreateBrandedSquare 180 0.82
$applePath = Join-Path $publicDir "apple-touch-icon.png"
$appleIcon.Save($applePath, [System.Drawing.Imaging.ImageFormat]::Png)
$appleIcon.Dispose()
Write-Output "Saved $applePath"

# 2. icon-192.png (192x192, scale 0.80 for Android shortcut safe area)
$icon192 = CreateBrandedSquare 192 0.80
$p192 = Join-Path $publicDir "icon-192.png"
$icon192.Save($p192, [System.Drawing.Imaging.ImageFormat]::Png)
$icon192.Dispose()
Write-Output "Saved $p192"

# 3. icon-512.png (512x512, scale 0.80)
$icon512 = CreateBrandedSquare 512 0.80
$p512 = Join-Path $publicDir "icon-512.png"
$icon512.Save($p512, [System.Drawing.Imaging.ImageFormat]::Png)
$icon512.Dispose()
Write-Output "Saved $p512"

# 4. favicon.png (128x128, scale 0.88)
$fav128 = CreateBrandedSquare 128 0.88
$p128 = Join-Path $publicDir "favicon.png"
$fav128.Save($p128, [System.Drawing.Imaging.ImageFormat]::Png)
$fav128.Dispose()
Write-Output "Saved $p128"

# 5. favicon-48x48.png
$fav48 = CreateBrandedSquare 48 0.90
$p48 = Join-Path $publicDir "favicon-48x48.png"
$fav48.Save($p48, [System.Drawing.Imaging.ImageFormat]::Png)

# 6. favicon-32x32.png
$fav32 = CreateBrandedSquare 32 0.92
$p32 = Join-Path $publicDir "favicon-32x32.png"
$fav32.Save($p32, [System.Drawing.Imaging.ImageFormat]::Png)

# 7. favicon-16x16.png
$fav16 = CreateBrandedSquare 16 0.94
$p16 = Join-Path $publicDir "favicon-16x16.png"
$fav16.Save($p16, [System.Drawing.Imaging.ImageFormat]::Png)

# 8. Create multi-resolution favicon.ico containing 16x16, 32x32, 48x48
$b16 = [System.IO.File]::ReadAllBytes($p16)
$b32 = [System.IO.File]::ReadAllBytes($p32)
$b48 = [System.IO.File]::ReadAllBytes($p48)

$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $ms

# ICO Header
$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]3)

$offset = 6 + (16 * 3)

# 16x16
$bw.Write([byte]16)
$bw.Write([byte]16)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([uint16]1)
$bw.Write([uint16]32)
$bw.Write([uint32]$b16.Length)
$bw.Write([uint32]$offset)
$offset += $b16.Length

# 32x32
$bw.Write([byte]32)
$bw.Write([byte]32)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([uint16]1)
$bw.Write([uint16]32)
$bw.Write([uint32]$b32.Length)
$bw.Write([uint32]$offset)
$offset += $b32.Length

# 48x48
$bw.Write([byte]48)
$bw.Write([byte]48)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([uint16]1)
$bw.Write([uint16]32)
$bw.Write([uint32]$b48.Length)
$bw.Write([uint32]$offset)

$bw.Write($b16, 0, $b16.Length)
$bw.Write($b32, 0, $b32.Length)
$bw.Write($b48, 0, $b48.Length)

$icoPath = Join-Path $publicDir "favicon.ico"
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
$bw.Dispose()
$ms.Dispose()
Write-Output "Saved multi-resolution $icoPath ($([System.IO.File]::ReadAllBytes($icoPath).Length) bytes)"

# 9. favicon.svg
$base64Logo = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($logoPath))
$svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <filter id="subtle-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.06)" />
    </filter>
  </defs>
  <!-- Clean white background with smooth rounded corners -->
  <rect width="128" height="128" rx="26" fill="#ffffff" filter="url(#subtle-shadow)" />
  <rect x="0.5" y="0.5" width="127" height="127" rx="25.5" fill="none" stroke="#f1f5f9" stroke-width="1" />
  
  <!-- Centered authentic 2-Minute Sermon brand logo -->
  <image href="data:image/png;base64,$base64Logo" x="11" y="27" width="106" height="70.67" preserveAspectRatio="xMidYMid meet" />
</svg>
"@

$svgPath = Join-Path $publicDir "favicon.svg"
[System.IO.File]::WriteAllText($svgPath, $svgContent, [System.Text.Encoding]::UTF8)
Write-Output "Saved $svgPath"

$fav16.Dispose()
$fav32.Dispose()
$fav48.Dispose()
$logo.Dispose()

Write-Output "🎉 All brand icons and favicons generated successfully from official logo!"
