import RetroGrid from "@/components/magicui/retro-grid";
import CreateMenuModal from "./createmenumodal";

import prisma from "@/lib/db";
import LetterPullup from "@/components/magicui/letter-pullup";

export default async function Home() {
  const menus = await prisma.menu.findMany();
  return (
    <>
      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
        <span className="pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-[#667db6] via-[#0082c8] to-[#667db6] bg-clip-text text-center text-7xl font-bold leading-none tracking-tighter text-transparent">
          Food'n'Family
        </span>

        <RetroGrid />
        <LetterPullup words={"Build with ❤️ by Alx"} delay={0.05} className="mb-3" />
        <div className="z-1 flex min-h-[2rem] items-center justify-center">
          <CreateMenuModal />
        </div>
      </div>

      {/* afficher tout les menus */}
      <div className="mt-8 px-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Menus disponibles</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {menus.map((menu) => (
            <li key={menu.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <a className="block hover:bg-gray-100 transition duration-200" href={`/menu/${menu.id}/carte`}>
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-gray-800">{menu.name}</h3>
                  </div>
                </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
