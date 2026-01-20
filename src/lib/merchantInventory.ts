import { STRAIN_LIBRARY, Strain } from './strainLibrary';

export type InventoryStatus = 'active' | 'inactive' | 'needs-coa';

export type InventoryState = {
    [strainId: string]: {
        status: InventoryStatus;
        hasCOA: boolean;
        dateAdded: string; // ISO date
    }
}

// Combined type for inventory items with strain data
export type InventoryItem = Strain & {
    inventory: {
        status: InventoryStatus;
        hasCOA: boolean;
        dateAdded: string;
    }
};

// Key for LocalStorage
const STORAGE_KEY = 'merchant_inventory_v1';

class MerchantInventoryService {
    private state: InventoryState = {};

    constructor() {
        this.load();
    }

    private load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.state = JSON.parse(stored);
            } else {
                this.initializeDefaults();
            }
        } catch (e) {
            console.error("Failed to load inventory", e);
            this.initializeDefaults();
        }
    }

    private initializeDefaults() {
        // Seed with some initial state for demo purposes matching the demoInventory user saw?
        // Let's set first 8 to match the demo data roughly, or just set generic defaults.
        // We'll set the first 10 strains to active to populate the dashboard.
        STRAIN_LIBRARY.slice(0, 10).forEach(s => {
            this.state[s.id] = {
                status: 'active',
                hasCOA: true,
                dateAdded: new Date().toISOString()
            };
        });

        this.save();
    }

    private save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error("Failed to save inventory", e);
        }
    }

    // Public API
    public getAllItems(): InventoryItem[] {
        return STRAIN_LIBRARY.map(strain => {
            const state = this.state[strain.id] || { status: 'inactive', hasCOA: false, dateAdded: new Date().toISOString() };
            return {
                ...strain,
                inventory: state
            };
        });
    }

    public updateStatus(id: string, status: InventoryStatus) {
        if (!this.state[id]) {
            this.state[id] = { status, hasCOA: status !== 'needs-coa', dateAdded: new Date().toISOString() };
        } else {
            this.state[id].status = status;
        }
        this.save();
    }

    public toggleCOA(id: string) {
        if (this.state[id]) {
            this.state[id].hasCOA = !this.state[id].hasCOA;
            this.save();
        } else {
            // Initialize if checking COA on an 'inactive' uninitialized item
            this.state[id] = { status: 'inactive', hasCOA: true, dateAdded: new Date().toISOString() };
            this.save();
        }
    }

    public getInventoryState(id: string) {
        return this.state[id];
    }
}

export const InventoryService = new MerchantInventoryService();
