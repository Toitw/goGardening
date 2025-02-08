
import { CreateGardenForm } from "@/components/create-garden-form";
import { useAuth } from "@/hooks/use-auth";

export default function NewGardenPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">Please log in to create a garden</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <CreateGardenForm />
    </div>
  );
}
