// utils/colors.js
export function getTipoColor(tipo) {
  switch (tipo) {
    case "Serie": return "bg-blue-500";
    case "Película": return "bg-green-500";
    case "Anime": return "bg-purple-500";
    case "Dorama": return "bg-pink-500";
    case "K-Drama": return "bg-yellow-600";
    default: return "bg-gray-500";
  }
}