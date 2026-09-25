import { useEffect, useRef } from 'react';

interface UseScannerProps {
  onScan: (barcode: string) => void;
  // Maximum time between keystrokes in milliseconds
  // Hardware scanners typically type much faster than 30ms per character
  maxDelay?: number; 
  // Minimum length of the barcode to trigger the scan
  minLength?: number;
  // Whether the hook is currently listening
  isActive?: boolean;
}

export const useGlobalScanner = ({
  onScan,
  maxDelay = 50, // 50ms is a safe buffer for scanners
  minLength = 4,
  isActive = true,
}: UseScannerProps) => {
  const buffer = useRef('');
  const lastKeyTime = useRef(Date.now());
  
  // Store the latest onScan callback so we don't need to include it in the useEffect 
  // dependency array, which would cause the event listener to detach/reattach on every render
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime.current;

      // If the time between keystrokes is too long, the user is likely typing manually.
      // Reset the buffer.
      if (timeDiff > maxDelay) {
        buffer.current = '';
      }

      // Barcode scanners usually append an "Enter" key at the end of the string
      if (e.key === 'Enter') {
        if (buffer.current.length >= minLength) {
          // Valid barcode scanned!
          onScanRef.current(buffer.current);
          
          // Prevent default to stop the Enter key from triggering form submissions
          e.preventDefault();
        }
        buffer.current = '';
      } 
      // Only capture single printable characters (ignore Shift, Ctrl, Alt, etc.)
      else if (e.key.length === 1) {
        buffer.current += e.key;
      }

      lastKeyTime.current = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, maxDelay, minLength]);
};
