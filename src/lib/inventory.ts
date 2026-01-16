/**
 * INVENTORY
 * Source: go_calc_tests.json (Test Vectors)
 * Status: Authoritative Chemical Data
 * 
 * Contains ONLY raw chemical cultivars.
 * NO mappings to strain_library.
 * NO implicit relationships.
 */

import { Inventory } from './calculationEngine';

export const INVENTORY: Inventory = {
    timestamp: "2026-01-10T09:00:00Z",
    cultivars: [
        {
            id: "c001",
            name: "Test Cultivar Alpha",
            thcPercent: 18.5,
            cbdPercent: 0.3,
            available: true,
            terpenes: {
                pinene: 1.2,
                limonene: 0.8,
                caryophyllene: 0.5,
                myrcene: 0.3,
                unknown_terpene_x: 0.1
            }
        },
        {
            id: "c002",
            name: "Test Cultivar Beta",
            thcPercent: 20.1,
            cbdPercent: 0.2,
            available: true,
            terpenes: {
                limonene: 1.5,
                pinene: 0.6,
                linalool: 0.4,
                terpinolene: 0.3
            }
        },
        {
            id: "c003",
            name: "Test Cultivar Gamma",
            thcPercent: 24.2,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                myrcene: 2.1,
                caryophyllene: 0.9,
                humulene: 0.5
            }
        },
        {
            id: "c004",
            name: "Test Cultivar Delta",
            thcPercent: 16.3,
            cbdPercent: 0.8,
            available: true,
            terpenes: {
                myrcene: 2.5,
                linalool: 0.9,
                caryophyllene: 0.6,
                bisabolol: 0.3
            }
        },
        {
            id: "c005",
            name: "Test Cultivar Epsilon",
            thcPercent: 22.7,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                limonene: 1.8,
                terpinolene: 1.2,
                pinene: 0.5
            }
        },
        {
            id: "c006",
            name: "Test Cultivar Zeta",
            thcPercent: 14.9,
            cbdPercent: 1.2,
            available: true,
            terpenes: {
                myrcene: 1.8,
                nerolidol: 0.7,
                humulene: 0.5,
                unknown_terp_y: 0.2
            }
        },
        {
            id: "c007",
            name: "Test Cultivar Eta",
            thcPercent: 19.2,
            cbdPercent: 0.4,
            available: true,
            terpenes: {
                terpinolene: 1.4,
                limonene: 1.1,
                ocimene: 0.8,
                valencene: 0.4,
                rare_terpene_alpha: 0.3,
                rare_terpene_beta: 0.2
            }
        },
        {
            id: "c008",
            name: "Test Cultivar Theta",
            thcPercent: 17.8,
            cbdPercent: 0.3,
            available: true,
            terpenes: {
                limonene: 2.0,
                pinene: 0.7,
                geraniol: 0.6,
                phellandrene: 0.4
            }
        },
        {
            id: "c009",
            name: "Test Cultivar Iota",
            thcPercent: 15.2,
            cbdPercent: 0.5,
            available: true,
            terpenes: {
                myrcene: 1.5,
                caryophyllene: 0.8
            }
        },
        {
            id: "c010",
            name: "Test Cultivar Kappa",
            thcPercent: 18.9,
            cbdPercent: 0.3,
            available: true,
            terpenes: {
                limonene: 1.2,
                pinene: 0.9
            }
        },
        {
            id: "c011",
            name: "Test Cultivar Lambda",
            thcPercent: 26.3,
            cbdPercent: 0.1,
            available: true,
            terpenes: {
                terpinolene: 1.8,
                limonene: 1.2,
                cymene: 0.5
            }
        },
        {
            id: "c012",
            name: "Test Cultivar Mu",
            thcPercent: 24.1,
            cbdPercent: 0.2,
            available: true,
            terpenes: {
                pinene: 1.5,
                limonene: 1.0,
                pulegone: 0.4
            }
        },
        {
            id: "c013",
            name: "Test Cultivar Nu",
            thcPercent: 18.5,
            cbdPercent: 3.2,
            available: true,
            terpenes: {
                pinene: 1.0,
                limonene: 0.8,
                caryophyllene: 0.9,
                linalool: 0.5
            }
        },
        {
            id: "c014",
            name: "Test Cultivar Xi",
            thcPercent: 20.2,
            cbdPercent: 2.8,
            available: true,
            terpenes: {
                limonene: 1.3,
                myrcene: 0.9,
                bisabolol: 0.4
            }
        },
        {
            id: "c015",
            name: "Test Cultivar Omicron",
            thcPercent: 17.4,
            cbdPercent: 0.4,
            available: true,
            terpenes: {
                pinene: 1.8,
                eucalyptol: 0.6,
                camphene: 0.3
            }
        },
        {
            id: "c016",
            name: "Test Cultivar Pi",
            thcPercent: 19.8,
            cbdPercent: 0.3,
            available: true,
            terpenes: {
                limonene: 1.4,
                valencene: 0.8,
                geraniol: 0.5
            }
        },
        {
            id: "c017",
            name: "Test Cultivar Rho",
            thcPercent: 16.2,
            cbdPercent: 0.6,
            available: true,
            terpenes: {
                myrcene: 1.2,
                linalool: 1.0,
                caryophyllene: 0.7,
                nerolidol: 0.4
            }
        },
        {
            id: "c018",
            name: "Test Cultivar Sigma",
            thcPercent: 12.8,
            cbdPercent: 1.5,
            available: true,
            terpenes: {
                myrcene: 2.2,
                linalool: 1.3,
                terpineol: 0.6
            }
        },
        {
            id: "c019",
            name: "Test Cultivar Tau",
            thcPercent: 14.1,
            cbdPercent: 0.9,
            available: true,
            terpenes: {
                myrcene: 1.8,
                caryophyllene: 1.1,
                borneol: 0.5,
                fenchol: 0.3
            }
        },
        {
            id: "c020",
            name: "Test Cultivar Upsilon",
            thcPercent: 18.9,
            cbdPercent: 0.4,
            available: true,
            terpenes: {
                limonene: 1.0,
                myrcene: 0.8,
                exotic_terp_1: 0.5,
                exotic_terp_2: 0.4,
                exotic_terp_3: 0.3,
                exotic_terp_4: 0.2
            }
        },
        {
            id: "c021",
            name: "Test Cultivar Phi",
            thcPercent: 17.3,
            cbdPercent: 0.5,
            available: true,
            terpenes: {
                pinene: 1.2,
                caryophyllene: 0.9,
                linalool: 0.6
            }
        },
        {
            id: "c022",
            name: "Test Cultivar Chi",
            thcPercent: 18.0,
            cbdPercent: 0.3,
            available: false,
            terpenes: {
                limonene: 1.5,
                pinene: 0.9
            }
        },
        {
            id: "c023",
            name: "Test Cultivar Psi",
            thcPercent: 19.5,
            cbdPercent: 0.4,
            available: false,
            terpenes: {
                myrcene: 1.8,
                caryophyllene: 0.7
            }
        }
    ]
};
