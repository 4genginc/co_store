import { Button } from "@/components/ui/button";
import { FaRegHeart } from "react-icons/fa";

type FavoriteToggleButtonProps = {
  productId: string;
};

export default function FavoriteToggleButton({
  productId,
}: FavoriteToggleButtonProps) {
  void productId;
  return (
    <Button size="icon" variant="outline" className="p-2 cursor-pointer">
      <FaRegHeart />
    </Button>
  );
}
