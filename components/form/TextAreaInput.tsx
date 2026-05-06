import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TextAreaInputProps = {
  name: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
};

export default function TextAreaInput({
  name,
  label,
  defaultValue,
  placeholder,
  rows = 5,
  required,
}: TextAreaInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="capitalize">
        {label ?? name}
      </Label>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
