import FormContainer, {
  type ActionState,
} from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import CheckBoxInput from "@/components/form/CheckBoxInput";
import ImageInput from "@/components/form/ImageInput";
import { SubmitButton } from "@/components/form/Buttons";

// Stub action — Phase 6.4 will replace this with the real createProductAction.
async function stubAction(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  "use server";
  return { message: "createProductAction not implemented yet", success: false };
}

export default function CreateProductPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl capitalize">create product</h1>
      <FormContainer action={stubAction} className="grid gap-4 max-w-xl">
        <FormInput name="name" required />
        <FormInput name="company" required />
        <PriceInput />
        <TextAreaInput name="description" required />
        <ImageInput required />
        <CheckBoxInput name="featured" label="featured" />
        <SubmitButton text="create product" />
      </FormContainer>
    </section>
  );
}
