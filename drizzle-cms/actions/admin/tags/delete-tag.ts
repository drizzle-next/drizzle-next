"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { tags } from "@/schema/tags";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/authorization";

const deleteTagSchema = z.object({
  id: z.coerce.string().uuid(),
}).pick({ id: true });

export interface DeleteTagState {
  errors?: {
    id?: string[];
  };
  message?: string;
}

export async function deleteTag(
  prevState: DeleteTagState,
  formData: FormData
): Promise<DeleteTagState> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("unauthenticated");
  }

  if (!isAdmin(session)) {
    throw new Error("unauthorized");
  }

  const validatedFields = deleteTagSchema.safeParse({
    id: formData.get("id"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid data",
    };
  }

  try {
    await db.delete(tags).where(eq(tags.id, validatedFields.data.id));
  } catch (error) {
    console.log(error);
    return {
      message: "Database error",
    }
  }

  revalidatePath("/admin/tags");
  redirect("/admin/tags?notice=Tag was successfully deleted");
}
