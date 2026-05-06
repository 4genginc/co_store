import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

import hero5 from "@/public/images/hero5.png";
import hero6 from "@/public/images/hero6.png";
import hero7 from "@/public/images/hero7.png";
import hero8 from "@/public/images/hero8.png";

const heroImages = [hero5, hero6, hero7, hero8];

export default function HeroCarousel() {
  return (
    <div className="hidden lg:block">
      <div className="grid grid-cols-2 gap-4">
        {heroImages.map((image, index) => (
          <Card key={index} className="p-0 overflow-hidden">
            <CardContent className="p-0">
              <Image
                src={image}
                alt={`hero ${index + 1}`}
                placeholder="blur"
                className="w-full h-[18rem] rounded object-cover"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
