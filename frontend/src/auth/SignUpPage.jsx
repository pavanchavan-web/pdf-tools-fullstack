import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="flex align-middle items-center my-15 justify-center auth">
      <SignUp redirectUrl="/"/>
    </div>
  );
}
