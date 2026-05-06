import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type CheckBoxInputProps = {
  name: string;
  label?: string;
  defaultChecked?: boolean;
};

export default function CheckBoxInput({
  name,
  label,
  defaultChecked,
}: CheckBoxInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={name} name={name} defaultChecked={defaultChecked} />
      <Label htmlFor={name} className="capitalize">
        {label ?? name}
      </Label>
    </div>
  );
}
