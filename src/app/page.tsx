import HomePageClient from "@/components/HomePageClient";
import Title from "@/components/Title/Title";
//import { ThemeToggle } from "@/components/ToggleDarkMode";
import Video, { ApiResponse } from "@/types/video";
import Footer from "@/components/Footer/Footer";

async function shuffleAction(value: number): Promise<Video[]> {
  "use server";

  // Server actions are public endpoints: never trust the incoming value.
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new Error("Invalid count");
  }

  const response = await fetch(
    `https://deepcut.vercel.app/api/blindpicks?count=${value}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch shuffled data");
  }
  const data = (await response.json()) as ApiResponse;
  return data.picks;
}

export default function Home() {
  return (
    <div className="font-sans container mx-auto px-6 sm:px-6 lg:px-8 pt-8 flex flex-col min-h-screen gap-2 sm:gap-10 ">
      <header className="w-full mb-18">
        <div className="flex w-full justify-start">
          <Title />
          {/* <div className="py-5">
            <ThemeToggle />
          </div> */}
        </div>
      </header>
      <main className="w-full justify-center flex flex-col items-center flex-grow">
        <HomePageClient shuffleAction={shuffleAction} />
      </main>
      <Footer />
    </div>
  );
}
