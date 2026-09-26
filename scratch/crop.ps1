Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\LENOVO\.gemini\antigravity-ide\brain\cb5ffcae-9756-4728-9a1a-29270c84ec66\.user_uploaded\media_1790432840514.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Left half: Jar artwork
$rectJar = New-Object System.Drawing.Rectangle(28, 34, 305, 356)
$jarBmp = $bmp.Clone($rectJar, $bmp.PixelFormat)
$jarBmp.Save("e:\Veloc Projects\Websites\makhana-nextjs\public\img\login-jar.png", [System.Drawing.Imaging.ImageFormat]::Png)
$jarBmp.Dispose()

# Floating corner makhana (bottom-right of the black section)
$rectCorner = New-Object System.Drawing.Rectangle(615, 305, 48, 85)
$cornerBmp = $bmp.Clone($rectCorner, $bmp.PixelFormat)
$cornerBmp.Save("e:\Veloc Projects\Websites\makhana-nextjs\public\img\login-corner-makhana.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cornerBmp.Dispose()

$bmp.Dispose()
Write-Host "Re-cropped successfully!"
