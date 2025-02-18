export type Crop = {
    id: string;
    name: string;
    npkRequirement: {
        N: number;
        P: number;
        K: number;
    };
    imageUrl?: string;
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
}