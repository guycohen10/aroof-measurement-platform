import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ClayTile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-orange-800 to-red-900 text-white py-20">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("RoofingTypesIndex")} className="text-orange-200 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-5xl font-bold mb-4">Clay Tile Roofing</h1>
          <p className="text-xl text-orange-100 max-w-3xl">
            Timeless Mediterranean elegance with 50-100 year lifespan
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-600">Price</div>
            <div className="text-xl font-bold text-orange-600">$12.00/sq ft</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Lifespan</div>
            <div className="text-xl font-bold">50-100 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-sm text-gray-600">Warranty</div>
            <div className="text-xl font-bold">50+ years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⚙️</div>
            <div className="text-sm text-gray-600">Install</div>
            <div className="text-xl font-bold">Complex</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                Clay tile roofing offers timeless beauty and can last over a century. Popular in Mediterranean, Spanish, and Southwestern architecture, these tiles are fire-proof, energy-efficient, and virtually maintenance-free. Heavy weight requires structural support.
              </p>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Pros & Cons</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Pros
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>50-100 year lifespan</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Timeless beauty</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Fireproof</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Energy efficient</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Low maintenance</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-4">✗ Cons</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Very expensive</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Heavy - needs reinforcement</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Tiles can crack</span></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white rounded-2xl p-6 shadow-xl sticky top-4">
            <h3 className="text-2xl font-bold mb-4">Get Estimate</h3>
            <Link to={createPageUrl("AddressMethodSelector")} className="block w-full bg-white text-orange-600 text-center py-3 rounded-lg font-bold hover:bg-orange-50">
              Measure - FREE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}