"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SeedDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const seedData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/seed-data");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to seed data");
      }

      setIsComplete(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg border">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Seed Documentation Data
        </h1>

        <p className="text-gray-600 mb-8 text-center">
          This will create sample categories and documents to help you get
          started with the documentation portal.
        </p>

        {isComplete ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-xl font-medium">Data Seeded Successfully!</h2>
            <p className="text-gray-600">
              Sample categories and documents have been created.
            </p>
            <Button
              onClick={() => router.push("/documents")}
              className="w-full mt-4"
            >
              Go to Documentation Portal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button onClick={seedData} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Data...
                </>
              ) : (
                "Seed Sample Data"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/documents")}
              className="w-full"
            >
              Skip (Go to Empty Portal)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
