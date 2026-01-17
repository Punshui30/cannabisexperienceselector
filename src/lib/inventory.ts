/**
 * INVENTORY
 * Source: chemotype_reference.json
 * Status: Authoritative Chemical Data
 * 
 * Mapped to STRAIN_LIBRARY via IDs.
 */

import { Inventory } from './calculationEngine';
import chemotypeData from '../data/chemotype_reference.json';

// Helper to convert snake_case JSON to Inventory Cultivar
const cultivars = chemotypeData.cultivars.map(c => ({
    id: c.id,
    name: c.name,
    thcPercent: c.thc_percent,
    cbdPercent: c.cbd_percent,
    available: true,
    terpenes: c.terpenes
}));

export const INVENTORY: Inventory = {
    timestamp: new Date().toISOString(),
    cultivars: cultivars
};

// HELPER: Resolver for UI components to get full chemotype data
export function resolveChemotype(strainId: string): typeof chemotypeData.cultivars[0] | null {
    const cultivar = chemotypeData.cultivars.find(c => c.id === strainId);
    return cultivar || null;
}
