// Helper component to capture map screenshots
// This doesn't render anything visible - just provides capture functions

export async function captureMapImage(mapElementId) {
  const mapContainer = document.getElementById(mapElementId);
  
  if (!mapContainer) {
    console.warn(`Map container with id "${mapElementId}" not found`);
    return null;
  }
  
  try {
    // Dynamic import of html2canvas (lazy load only when needed)
    const html2canvas = (await import('html2canvas')).default;
    
    console.log(`📸 Capturing ${mapElementId}...`);
    
    // Wait a bit for map tiles to fully load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = await html2canvas(mapContainer, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      removeContainer: false
    });
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    console.log(`✅ Captured ${mapElementId} successfully`);
    
    return dataUrl;
    
  } catch (error) {
    console.error(`Error capturing ${mapElementId}:`, error);
    return null;
  }
}

export function showLoadingOverlay(message) {
  // Remove any existing overlay first
  hideLoadingOverlay();
  
  const overlay = document.createElement('div');
  overlay.id = 'pdf-loading-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    ">
      <div style="
        background: white;
        padding: 50px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        max-width: 400px;
      ">
        <div style="
          width: 60px;
          height: 60px;
          border: 6px solid #f3f4f6;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        "></div>
        <h2 style="
          margin: 0 0 12px 0;
          color: #1e293b;
          font-size: 20px;
          font-weight: 700;
        ">${message}</h2>
        <p style="
          margin: 0;
          color: #64748b;
          font-size: 14px;
        ">This may take 10-30 seconds...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(overlay);
}

export function hideLoadingOverlay() {
  const overlay = document.getElementById('pdf-loading-overlay');
  if (overlay) overlay.remove();
}