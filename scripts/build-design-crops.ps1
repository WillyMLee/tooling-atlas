$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$atlasRoot = Split-Path -Parent $PSScriptRoot
$atlasDesignRoot = Join-Path $atlasRoot 'assets\designs'
$atlasRegionRoot = Join-Path $atlasDesignRoot 'regions'
$atlasRegionRootResolved = [System.IO.Path]::GetFullPath($atlasRegionRoot)

$atlasRegions = @(
  @{ Name = '01-header'; X = 0.00; Y = 0.00; W = 1.00; H = 0.23 },
  @{ Name = '02-primary'; X = 0.00; Y = 0.16; W = 0.60; H = 0.67 },
  @{ Name = '03-supporting'; X = 0.55; Y = 0.16; W = 0.45; H = 0.67 }
)

Get-ChildItem -LiteralPath $atlasDesignRoot -Filter '*-hero.png' | ForEach-Object {
  $atlasSlug = $_.BaseName -replace '-hero$', ''
  $atlasTarget = [System.IO.Path]::GetFullPath((Join-Path $atlasRegionRoot $atlasSlug))
  if (-not $atlasTarget.StartsWith($atlasRegionRootResolved, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to write outside the design region directory: $atlasTarget"
  }
  New-Item -ItemType Directory -Path $atlasTarget -Force | Out-Null
  $atlasImage = [System.Drawing.Bitmap]::FromFile($_.FullName)
  try {
    foreach ($atlasRegion in $atlasRegions) {
      $atlasX = [Math]::Floor($atlasImage.Width * $atlasRegion.X)
      $atlasY = [Math]::Floor($atlasImage.Height * $atlasRegion.Y)
      $atlasWidth = [Math]::Min([Math]::Floor($atlasImage.Width * $atlasRegion.W), $atlasImage.Width - $atlasX)
      $atlasHeight = [Math]::Min([Math]::Floor($atlasImage.Height * $atlasRegion.H), $atlasImage.Height - $atlasY)
      $atlasRectangle = [System.Drawing.Rectangle]::new($atlasX, $atlasY, $atlasWidth, $atlasHeight)
      $atlasCrop = $atlasImage.Clone($atlasRectangle, $atlasImage.PixelFormat)
      try {
        $atlasOutput = Join-Path $atlasTarget "$($atlasRegion.Name).png"
        $atlasCrop.Save($atlasOutput, [System.Drawing.Imaging.ImageFormat]::Png)
      } finally {
        $atlasCrop.Dispose()
      }
    }
  } finally {
    $atlasImage.Dispose()
  }
}

Write-Output "Generated component crops in $atlasRegionRoot"
