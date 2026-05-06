import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import CheckBoxInput from "@/components/form/CheckBoxInput";
import { SubmitButton } from "@/components/form/Buttons";
import { updateProductAction } from "@/utils/actions";
import { fetchAdminProductDetails } from "@/utils/queries";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await fetchAdminProductDetails(id);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl capitalize">edit product</h1>
      <FormContainer
        action={updateProductAction}
        className="grid gap-4 max-w-xl"
      >
        <input type="hidden" name="productId" value={product.id} />
        <FormInput name="name" defaultValue={product.name} required />
        <FormInput name="company" defaultValue={product.company} required />
        <PriceInput defaultValue={product.price} />
        <TextAreaInput
          name="description"
          defaultValue={product.description}
          required
        />
        <CheckBoxInput
          name="featured"
          label="featured"
          defaultChecked={product.featured}
        />
        <SubmitButton text="update product" />
      </FormContainer>
    </section>
  );
}
