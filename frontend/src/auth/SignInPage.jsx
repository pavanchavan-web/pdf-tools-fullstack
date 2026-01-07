import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="flex align-middle items-center my-15 justify-center auth">
      <SignIn redirectUrl="/"/>
    </div>
  );
}
