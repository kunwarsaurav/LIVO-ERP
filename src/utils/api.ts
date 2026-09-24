import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// TEMPORARY MOCK FOR UI TESTING (Since we deleted mockData.ts)
// This allows you to see the barcodes and UI while the real backend is being integrated.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend isn't running, return dummy data so the UI doesn't look empty
    if (error.config.url === '/products') {
      console.warn("Backend not found. Returning mock products for UI testing.");
      return Promise.resolve({
        data: [
          {
            id: 'prod-1',
            sku: 'SOFA-BLU-01',
            name: 'Velvet Azure Sofa',
            brand: 'Livo Signature',
            category: 'Sofa',
            modelNumber: 'MDL-2024-VZ',
            sizeDimensions: '210 x 90 x 85 cm',
            colorFinish: 'Navy Blue Velvet',
            purchasePrice: 450,
            sellingPrice: 1200,
            mrp: 1500,
            currentStock: 12,
            minAlertStock: 3,
            supplierName: 'Milano Artisan Works',
            barcode: '123456789012',
            warrantyYears: 5,
            imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200',
          },
          {
            id: 'prod-2',
            sku: 'BED-QEN-OAK',
            name: 'Oakwood Queen Bed',
            brand: 'Livo Standard',
            category: 'Bed',
            modelNumber: 'MDL-OQ-99',
            sizeDimensions: '160 x 200 cm',
            colorFinish: 'Natural Oak',
            purchasePrice: 300,
            sellingPrice: 850,
            mrp: 1100,
            currentStock: 5,
            minAlertStock: 2,
            supplierName: 'Nordic Woodcrafters',
            barcode: '987654321098',
            warrantyYears: 3,
            imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=200',
          }
        ]
      });
    }
    // Return empty arrays for other endpoints so the app doesn't crash
    return Promise.resolve({ data: [] });
  }
);

export default api;
