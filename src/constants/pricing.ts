export const DEFAULT_PRICING = {
    materials: {
        shingles: {
            price: 152.10,  // GAF Timberline HDZ retail price per square
        },
        ridge_caps: {
            price: 85.00,  // Price per bundle
        },
        starter: {
            price: 45.00,  // Price per bundle
        },
        drip_edge: {
            price: 7.50,  // Price per piece
            cost: 6.00,   // Manufacturer cost per piece
        },
        ice_water: {
            price: 117.50,  // Price per roll
        },
    },
} as const; 