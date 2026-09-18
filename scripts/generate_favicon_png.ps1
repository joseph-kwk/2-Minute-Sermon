Add-Type -AssemblyName System.Drawing

$logoPath = (Resolve-Path "$PSScriptRoot/../public/assets/logo.png").Path
$outPath = Join-Path (Resolve-Path "$PSScriptRoot/../public").Path 'favicon.png'

$size = 128
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Pure white background
$bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g.FillRectangle($bgBrush, 0, 0, $size, $size)

# Subtle light border
$borderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 226, 232, 240)), 1
$g.DrawRectangle($borderPen, 0, 0, $size - 1, $size - 1)

# Draw Logo centered with preserved 3:2 aspect ratio (104px wide by 69px high)
$logo = [System.Drawing.Image]::FromFile($logoPath)
$targetW = 104
$targetH = [int]($targetW * $logo.Height / $logo.Width)
$targetX = [int](($size - $targetW) / 2)
$targetY = [int](($size - $targetH) / 2)

$g.DrawImage($logo, $targetX, $targetY, $targetW, $targetH)

$g.Dispose()
$logo.Dispose()
$bgBrush.Dispose()
$borderPen.Dispose()

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Output "Successfully generated favicon.png at $outPath"
