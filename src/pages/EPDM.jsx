import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function EPDM() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-black text-white py-20">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("RoofingTypesIndex")} className="text-gray-300 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-5xl font-bold mb-4">EPDM Rubber Roofing</h1>
          <p className="text-xl text-gray-200">Durable, affordable flat roof solution - 20-25 year lifespan</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-600">Price</div>
            <div className="text-xl font-bold">$5.00/sq ft</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Lifespan</div>
            <div className="text-xl font-bold">20-25 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-sm text-gray-600">Warranty</div>
            <div className="text-xl font-bold">20-25 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⚙️</div>
            <div className="text-sm text-gray-600">Install</div>
            <div className="text-xl font-bold">Easy</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                EPDM (Ethylene Propylene Diene Monomer) rubber roofing is a proven flat roof solution with decades of reliability. The black rubber membrane is extremely durable, weather-resistant, and one of the most affordable flat roofing options available.
              </p>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Pros & Cons</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-green-600 mb-4"><CheckCircle className="w-5 h-5 inline" /> Pros</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Very affordable</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Easy installation</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Durable & flexible</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Low maintenance</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-4">✗ Cons</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Black color absorbs heat</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Can puncture</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Seams can fail</span></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-black text-white rounded-2xl p-6 shadow-xl sticky top-4">
            <h3 className="text-2xl font-bold mb-4">Get Estimate</h3>
            <Link to={createPageUrl("AddressMethodSelector")} className="block w-full bg-white text-gray-900 text-center py-3 rounded-lg font-bold">
              Measure - FREE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}