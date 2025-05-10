import Buscador from "./Buscador";


export default function Navbar() {

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow fixed top-0 w-full z-50">
      <div className="text-xl font-bold">
        <a href="/">🎬 MiCatálogo</a>
      </div>
      <div className="w-1/2">
        <Buscador />
      </div>
    </nav>
  );
}
