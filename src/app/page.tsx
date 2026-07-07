import HomePageClient from "@/components/HomePageClient";
import Title from "@/components/Title/Title";
import Video, { ApiResponse } from "@/types/video";
import Footer from "@/components/Footer/Footer";

const API_BASE = "https://deepcut.vercel.app/api";
const TAG_RE = /^[a-z0-9-]{1,24}$/;

async function shuffleAction(value: number, tags: string[]): Promise<Video[]> {
  "use server";

  // Server actions are public endpoints: never trust the incoming values.
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new Error("Invalid count");
  }
  const safeTags = (Array.isArray(tags) ? tags : [])
    .filter((t) => typeof t === "string" && TAG_RE.test(t))
    .slice(0, 5);

  const params = new URLSearchParams({ count: String(value) });
  if (safeTags.length) params.set("tags", safeTags.join(","));

  const response = await fetch(`${API_BASE}/blindpicks?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch shuffled data");
  }
  const data = (await response.json()) as ApiResponse;
  return data.picks;
}

async function getTags(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/tags`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { tags: { tag: string }[] };
    return data.tags.map((t) => t.tag);
  } catch {
    return [];
  }
}

export default async function Home() {
  const availableTags = await getTags();

  return (
    <div className="font-sans container mx-auto px-6 sm:px-6 lg:px-8 pt-8 flex flex-col min-h-screen gap-2 sm:gap-10 ">
      <header className="w-full mb-18">
        <div className="flex w-full justify-start">
          <Title />
        </div>
      </header>
      <main className="w-full justify-center flex flex-col items-center flex-grow">
        <HomePageClient
          shuffleAction={shuffleAction}
          availableTags={availableTags}
        />
      </main>
      <Footer />
    </div>
  );
}
