import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-zinc-50">Create account</h1>
          <p className="text-zinc-400">Join the university bulletin board</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
