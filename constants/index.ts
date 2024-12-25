import plant1 from "@/assets/images/plant1.png";
import plant2 from "@/assets/images/plant2.png";
import plant3 from "@/assets/images/plant3.png";

export const images = {
    onboarding1: plant1,
    onboarding2: plant2,
    onboarding3: plant3,
}

export const onboarding = [
    {
      id: 1,
      title: "Welcome to Plant Perfect!",
      description:
        "Gain deep insights about the plants you'd like to grow.",
      image: images.onboarding1,
    },
    {
      id: 2,
      title: "Highly accurate Disease detection",
      description:
        "Our AI-powered disease detection system will help you identify diseases in your plants.",
      image: images.onboarding2,
    },
    {
      id: 3,
      title: "Detect Pest in your garden, take quick action with the help of our app!",
      description:
        "Our AI-powered pest detection system will help you identify pests in your plants.",
      image: images.onboarding3,
    },
  ];