import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type FormInputProps = {
  name: string;
  label?: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

export default function FormInput({
  name,
  label,
  type = "text",
  defaultValue,
  placeholder,
  required,
}: FormInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="capitalize">
        {label ?? name}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
