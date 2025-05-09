import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">🏠 HomeManager App</h1>
      <p className="text-lg mb-6">
        Simplify your home life. One app for chores, bills, shopping, and more.
      </p>

      <SignedOut>
        <div className="flex gap-4">
          <SignInButton>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </SignedOut>

      <SignedIn>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Go to Dashboard
        </Link>
      </SignedIn>
    </main>
  );
}
