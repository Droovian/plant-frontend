export interface IndianState {
    id: string
    name: string
    region: "North" | "South" | "East" | "West" | "Central" | "Northeast"
  }
  
  export interface RegionalFertilizer {
    id: string
    stateId: string
    fertilizerId: string
    subsidyPercentage: number 
    isPreferred: boolean 
  }

export type Crop = {
    id: string;
    name: string;
    npkRequirement: {
        N: number;
        P: number;
        K: number;
    };
    imageUrl?: string;
    description: string;
}

export type Fertilizer = {
    id: string;
    name: string;
    composition: { 
        N: number;
        P: number;
        K: number;
    };
    costPerBag: number;
    bagWeightKg: number;
    description?: string;
}

export type compatibilityInfo = {
    [plantName: string]: {
        companions?: string[];
        avoid?: string[];
    }
}