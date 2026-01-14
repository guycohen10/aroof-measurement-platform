import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function TPO() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-700 to-cyan-800 text-white py-20">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("RoofingTypesIndex")} className="text-blue-200 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-5xl font-bold mb-4">TPO Flat Roofing</h1>
          <p className="text-xl text-blue-100">Energy-efficient single-ply membrane for flat/low-slope roofs</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-600">Price</div>
            <div className="text-xl font-bold text-cyan-600">$5.50/sq ft</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Lifespan</div>
            <div className="text-xl font-bold">15-20 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-sm text-gray-600">Warranty</div>
            <div className="text-xl font-bold">15-20 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⚙️</div>
            <div className="text-sm text-gray-600">Install</div>
            <div className="text-xl font-bold">Moderate</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                TPO (Thermoplastic Polyolefin) is a popular single-ply roofing membrane for flat and low-slope roofs. Its white reflective surface provides excellent energy efficiency, reducing cooling costs by up to 30%. Ideal for commercial buildings and modern homes with flat sections.
              </p>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Pros & Cons</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-green-600 mb-4"><CheckCircle className="w-5 h-5 inline" /> Pros</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Energy efficient white surface</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Heat-welded seams (watertight)</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Resistant to UV/ozone</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Affordable</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-4">✗ Cons</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Shorter lifespan</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Puncture vulnerable</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Flat roofs only</span></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl p-6 shadow-xl sticky top-4">
            <h3 className="text-2xl font-bold mb-4">Get Estimate</h3>
            <Link to={createPageUrl("AddressMethodSelector")} className="block w-full bg-white text-cyan-700 text-center py-3 rounded-lg font-bold">
              Measure - FREE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}