// Image optimization utilities for the map component

export const analyzeImagePerformance = async () => {
    const performance = {
        totalSize: 0,
        images: [],
        recommendations: []
    };

    // Import regionData dynamically
    const { regionData } = await import('../data/regionData');

    const imageUrls = [];

    // Collect all image URLs
    Object.values(regionData).forEach(region => {
        if (region.overlay) imageUrls.push(region.overlay);
        if (region.label?.heb) imageUrls.push(region.label.heb);
        if (region.label?.eng) imageUrls.push(region.label.eng);
    });

    // Analyze each image
    for (const url of imageUrls) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const sizeInKB = blob.size / 1024;

            performance.images.push({
                url,
                sizeKB: Math.round(sizeInKB),
                sizeMB: (sizeInKB / 1024).toFixed(2)
            });

            performance.totalSize += sizeInKB;
        } catch (error) {
            console.error(`Failed to analyze ${url}:`, error);
        }
    }

    // Generate recommendations
    const totalSizeMB = (performance.totalSize / 1024).toFixed(2);

    if (performance.totalSize > 5120) { // > 5MB
        performance.recommendations.push(
            'Consider using a CDN - your total image size exceeds 5MB'
        );
    }

    const largeImages = performance.images.filter(img => img.sizeKB > 200);
    if (largeImages.length > 0) {
        performance.recommendations.push(
            `${largeImages.length} images are over 200KB - consider optimization`
        );
    }

    performance.recommendations.push(
        'Consider converting PNGs to WebP format for 30-50% size reduction',
        'Use an image CDN like Cloudinary or Imgix for automatic optimization'
    );

    return {
        ...performance,
        totalSizeMB,
        imageCount: performance.images.length
    };
};

// Helper to convert images to WebP (requires server-side processing)
export const getWebPUrl = (originalUrl, cdnBaseUrl) => {
    // Example for Cloudinary
    const filename = originalUrl.split('/').pop().replace('.png', '');
    return `${cdnBaseUrl}/f_webp,q_auto/${filename}`;
};

// Debounce utility for hover events
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}; 