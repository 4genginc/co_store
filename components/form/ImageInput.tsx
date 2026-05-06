import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type ImageInputProps = {
  name?: string;
  label?: string;
  required?: boolean;
};

export default function ImageInput({
  name = "image",
  label = "image",
  required,
}: ImageInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="capitalize">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type="file"
        accept="image/*"
        required={required}
      />
    </div>
  );
}
