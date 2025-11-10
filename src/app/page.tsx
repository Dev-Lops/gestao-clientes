<<<<<<< HEAD
// src/app/page.tsx
=======

>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
<<<<<<< HEAD
  const supabase = createServerSupabaseClient();

=======
  const supabase = await createServerSupabaseClient();
>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return redirect(user ? "/dashboard" : "/auth/login");
}
