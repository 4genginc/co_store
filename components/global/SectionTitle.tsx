type SectionTitleProps = {
  text: string;
};

export default function SectionTitle({ text }: SectionTitleProps) {
  return (
    <div>
      <h2 className="text-3xl font-medium tracking-wider capitalize">{text}</h2>
      <div className="border-b mt-2" />
    </div>
  );
}
