import { getCategory } from "@/lib/actions";
import EditCategoryForm from "@/components/EditCategoryForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <EditCategoryForm
      category={{
        id: category.id,
        name: category.name,
        budgetLimit: category.budgetLimit,
        color: category.color,
      }}
    />
  );
}
