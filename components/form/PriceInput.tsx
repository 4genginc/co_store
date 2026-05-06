import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type PriceInputProps = {
  name?: string;
  label?: string;
  defaultValue?: number;
};

export default function PriceInput({
  name = "price",
  label = "price (cents)",
  defaultValue,
}: PriceInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="capitalize">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type="number"
        min={0}
        step={1}
        defaultValue={defaultValue}
        required
      />
    </div>
  );
}
