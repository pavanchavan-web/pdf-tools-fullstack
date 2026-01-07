import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

export default function Dashboard() {
  return (
    <>
      <SignedIn>
        <div className="p-10">
          <h1 className="text-2xl font-bold">
            Dashboard (Protected)
          </h1>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
