/**
 * INVENTORY
 * Source: Lab Testing Data
 * Status: Authoritative Chemical Data
 * 
 * Mapped to STRAIN_LIBRARY via IDs.
 */

import { Inventory } from './calculationEngine';

export const INVENTORY: Inventory = {
    timestamp: "2026-01-16T12:00:00Z",
    cultivars: [
        {
            id: "strain_001", // Blue Dream
            name: "Blue Dream",
            thcPercent: 18.5,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                myrcene: 0.8,
                pinene: 0.5,
                caryophyllene: 0.4,
                limonene: 0.3
            }
        },
        {
            id: "strain_002", // Sour Diesel
            name: "Sour Diesel",
            thcPercent: 22.1,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                caryophyllene: 0.9,
                limonene: 0.8,
                myrcene: 0.5,
                humulene: 0.3
            }
        },
        {
            id: "strain_003", // OG Kush
            name: "OG Kush",
            thcPercent: 24.5,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                myrcene: 1.2,
                limonene: 0.8,
                caryophyllene: 0.6,
                linalool: 0.2
            }
        },
        {
            id: "strain_004", // Granddaddy Purple
            name: "Granddaddy Purple",
            thcPercent: 17.8,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                myrcene: 1.1,
                pinene: 0.6,
                caryophyllene: 0.5,
                linalool: 0.4
            }
        },
        {
            id: "strain_005", // Green Crack
            name: "Green Crack",
            thcPercent: 19.5,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                myrcene: 0.9,
                caryophyllene: 0.6,
                pinene: 0.5,
                limonene: 0.4
            }
        },
        {
            id: "strain_006", // Girl Scout Cookies
            name: "Girl Scout Cookies",
            thcPercent: 26.2,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                caryophyllene: 1.0,
                limonene: 0.7,
                humulene: 0.4,
                linalool: 0.3
            }
        },
        {
            id: "strain_008", // Jack Herer
            name: "Jack Herer",
            thcPercent: 18.2,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                terpinolene: 1.4,
                caryophyllene: 0.7,
                pinene: 0.5,
                myrcene: 0.2
            }
        },
        {
            id: "strain_009", // Northern Lights
            name: "Northern Lights",
            thcPercent: 16.5,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                myrcene: 1.3,
                caryophyllene: 0.6,
                pinene: 0.4,
                limonene: 0.2
            }
        },
        {
            id: "strain_010", // Durban Poison
            name: "Durban Poison",
            thcPercent: 21.5,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                terpinolene: 1.8,
                myrcene: 0.5,
                ocimene: 0.3,
                limonene: 0.2
            }
        },
        {
            id: "strain_011", // Wedding Cake
            name: "Wedding Cake",
            thcPercent: 23.8,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                limonene: 1.1,
                caryophyllene: 0.9,
                myrcene: 0.6,
                linalool: 0.3
            }
        },
        {
            id: "strain_012", // Gorilla Glue #4
            name: "Gorilla Glue #4",
            thcPercent: 27.5,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                caryophyllene: 1.5,
                limonene: 0.8,
                myrcene: 0.7,
                humulene: 0.4
            }
        },
        {
            id: "strain_018", // Super Lemon Haze
            name: "Super Lemon Haze",
            thcPercent: 19.3,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                terpinolene: 1.2,
                caryophyllene: 0.8,
                ocimene: 0.5,
                myrcene: 0.4
            }
        },
        {
            id: "strain_029", // Harlequin (CBD Heavy)
            name: "Harlequin",
            thcPercent: 5.5,
            cbdPercent: 8.5,
            available: true,
            terpenes: {
                myrcene: 1.5,
                pinene: 0.8,
                caryophyllene: 0.6,
                limonene: 0.2
            }
        },
        {
            id: "strain_043", // Tahoe OG
            name: "Tahoe OG",
            thcPercent: 21.0,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                limonene: 1.3,
                myrcene: 0.9,
                caryophyllene: 0.5,
                linalool: 0.2
            }
        },
        {
            id: "strain_045", // Lemon Haze
            name: "Lemon Haze",
            thcPercent: 18.8,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                limonene: 1.6,
                caryophyllene: 0.6,
                myrcene: 0.4,
                linalool: 0.1
            }
        }
    ]
};
