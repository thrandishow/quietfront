"use client";
import React from "react";
import Navbar from "./ui/navbar";
import Footer from "./ui/footer";

export default function Home() {
  return (
    <div id="webcrumbs">
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        {/* Header */}
        <Navbar />

        {/* Hero section */}
        <section className="relative w-full px-6 sfm:px-10 md:px-16 lg:px-24 xl:px-32 py-32 lg:py-40">
          <div className="absolute inset-0 bg-[url('/poezd.png')] bg-cover bg-center z-0" />
          <div className="absolute inset-0 bg-black/60 z-0" />

          <div className="relative z-10 flex flex-col items-center justify-center gap-10 text-center">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                Связь между машинистом и диспетчером.
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-white font-medium">
                Быстро. Надёжно. Безопасно
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="#addinfo"
                  className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  Дополнительная информация
                </a>
                <a
                  href="#addinfo"
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  О нашем проекте
                </a>
              </div>
            </div>
          </div>
        </section>
        <section
          id="addinfo"
          className="w-full px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 py-24 lg:py-32 bg-white"
        >
          <div className="flex flex-col items-center justify-center gap-8 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-blue-600">
              Безопасность в метро — не данность.
            </h2>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-blue-600">
              Это результат.
            </h2>

            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              Каждый пассажир верит: метро — это надёжно. Но что, если человек
              упадёт на рельсы? Или поезд остановится в тоннеле из-за сбоя
              связи, оставив сотни людей в ловушке?
            </p>

            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              Проблема — в устаревшей системе радиосвязи. Представьте:
              диспетчеру нужно передать 40 разных команд в шумной комнате — и
              каждая из них критически важна. Даже при максимальной концентрации
              человеческий фактор и технические ограничения неизбежно приводят к
              задержкам и ошибкам.
            </p>

            <div className="mt-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-blue-600">
                Мы это меняем.
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Наша система обеспечивает мгновенную, безошибочную и
                подтверждённую связь между диспетчером и машинистом. Команды
                приходят прямо в кабину поезда — чётко, надёжно и без помех.
              </p>
            </div>

            <p className="text-lg font-medium text-gray-800 mt-6">
              Результат для вас: меньше задержек, никаких «застрявших» поездов —
              только предсказуемое, безопасное и пунктуальное метро.
            </p>
          </div>
        </section>
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
