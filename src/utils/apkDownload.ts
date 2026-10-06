/**
 * Safely downloads the Android APK using a blob URL to prevent
 * the preview iframe from navigating and causing iframe connection errors.
 */
export async function downloadApkSafely(onStatusChange?: (status: string) => void): Promise<boolean> {
  try {
    if (onStatusChange) onStatusChange('Downloading APK (22.4 MB)...');
    const response = await fetch('/app-debug.apk?t=' + Date.now(), {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.href = objectUrl;
    tempLink.download = 'AttendIQ-latest.apk';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 4000);
    if (onStatusChange) onStatusChange('Download started!');
    return true;
  } catch (err) {
    console.warn('Blob APK download issue:', err);
    if (onStatusChange) onStatusChange('Please use direct link or QR code below.');
    return false;
  }
}
