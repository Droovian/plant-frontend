import { Fertilizer, Crop } from "@/types/plant";

const fertilizers: Fertilizer[] = [
    {
      id: "urea",
      name: "Urea",
      composition: { N: 46, P: 0, K: 0 },
      costPerBag: 276.12,
      bagWeightKg: 50
    },
    {
      id: "dap",
      name: "Di-Ammonium Phosphate (DAP)",
      composition: { N: 18, P: 46, K: 0 },
      costPerBag: 1125.00,
      bagWeightKg: 50
    },
    {
      id: "ssp",
      name: "Single Super Phosphate (SSP)",
      composition: { N: 0, P: 16, K: 0 },
      costPerBag: 375.00,
      bagWeightKg: 50
    },
    {
      id: "mop",
      name: "Muriate of Potash (MOP)",
      composition: { N: 0, P: 0, K: 60 },
      costPerBag: 800.00,
      bagWeightKg: 50
    },
    {
      id: "sop",
      name: "Sulphate of Potash (SOP)",
      composition: { N: 0, P: 0, K: 50 },
      costPerBag: 1200.00,
      bagWeightKg: 50
    }
  ];
  
  const crops: Crop[] = [
    {
      id: "wheat",
      name: "Wheat",
      npkRequirement: { N: 120, P: 60, K: 40 }
    },
    {
      id: "rice",
      name: "Rice",
      npkRequirement: { N: 100, P: 50, K: 50 }
    },
    {
      id: "maize",
      name: "Maize",
      npkRequirement: { N: 150, P: 75, K: 50 }
    },
    {
        id: "tomato",
        name: "Tomato",
        npkRequirement: { N: 90, P: 45, K: 60 }
      },
      {
        id: "potato",
        name: "Potato",
        npkRequirement: { N: 120, P: 50, K: 150 }
      }
  ];
  
  export { fertilizers, crops };
  