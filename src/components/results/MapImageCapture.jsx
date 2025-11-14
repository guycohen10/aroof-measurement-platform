import React, { useEffect } from 'react';

// Helper component to capture map screenshots with proper roof focus
export default function MapImageCapture({ measurement, onSatelliteImageCaptured, onDiagramImageCaptured }) {
  useEffect(() => {
    const captureImages = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Capture both satellite and diagram views
      const satelliteImage = await captureMapImage('interactive-map-container', true);
      if (satelliteImage && onSatelliteImageCaptured) {
        onSatelliteImageCaptured(satelliteImage);
      }

      const diagramImage = await captureMapImage('interactive-map-container', false);
      if (diagramImage && onDiagramImageCaptured) {
        onDiagramImageCaptured(diagramImage);
      }
    };

    captureImages();
  }, [measurement, onSatelliteImageCaptured, onDiagramImageCaptured]);

  return null;
}

// Capture map with roof-focused bounds
export async function captureMapImage(mapElementId, cleanView = false) {
  const mapContainer = document.getElementById(mapElementId);
  
  if (!mapContainer) {
    console.warn(`Map container "${mapElementId}" not found`);
    return null;
  }
  
  try {
    const html2canvas = (await import('html2canvas')).default;
    
    console.log(`📸 Capturing ${cleanView ? 'satellite' : 'diagram'} view...`);
    
    // Hide UI elements if clean view
    let hiddenElements = [];
    if (cleanView) {
      const uiElements = mapContainer.querySelectorAll('.gm-style-cc, .gmnoprint, button, .gm-control-active');
      uiElements.forEach(el => {
        if (el.style.display !== 'none') {
          hiddenElements.push({ el, display: el.style.display });
          el.style.display = 'none';
        }
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = await html2canvas(mapContainer, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false
    });
    
    // Restore hidden elements
    hiddenElements.forEach(({ el, display }) => {
      el.style.display = display;
    });
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    console.log(`✅ Captured successfully`);
    
    return dataUrl;
    
  } catch (error) {
    console.error(`Error capturing image:`, error);
    return null;
  }
}

export function showLoadingOverlay(message) {
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