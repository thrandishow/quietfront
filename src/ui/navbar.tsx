export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm shadow-sm py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Логотип или название */}
        <div className="font-bold text-gray-800">Тихий эфир</div>

        {/* Простое меню — видно везде */}
        <nav>
          <a
            href="#info"
            className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
          >
            Главная
          </a>
        </nav>
      </div>
    </header>
  );
}
