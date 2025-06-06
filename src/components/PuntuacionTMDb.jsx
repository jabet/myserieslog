export default function PuntuacionTMDb({ puntuacion }) {
  return (
    <div className="flex items-center gap-2 bg-[#032541] text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
      <img
        src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg"
        alt="TMDb"
        className="h-5 w-auto"
        style={{ filter: "brightness(0) invert(1)" }}
      />
      <span>{puntuacion ? puntuacion.toFixed(1) : "N/A"}</span>
    </div>
  );
}