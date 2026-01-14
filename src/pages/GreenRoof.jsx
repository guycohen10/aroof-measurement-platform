import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle, Leaf } from 'lucide-react';

export default function GreenRoof() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-green-700 to-emerald-900 text-white py-20">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("RoofingTypesIndex")} className="text-green-200 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
            Green/Living Roof <Leaf className="w-12 h-12 text-green-300" />
          </h1>
          <p className="text-xl text-green-50">Eco-friendly vegetation layer - sustainability meets innovation</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-600">Price</div>
            <div className="text-xl font-bold text-green-600">$15.00/sq ft</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Lifespan</div>
            <div className="text-xl font-bold">30-50 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-sm text-gray-600">Warranty</div>
            <div className="text-xl font-bold">30-40 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🌿</div>
            <div className="text-sm text-gray-600">Eco Rating</div>
            <div className="text-xl font-bold text-green-600">★★★★★</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                Green roofs feature a waterproof membrane topped with soil and vegetation. They provide exceptional insulation, manage stormwater, reduce urban heat islands, and create habitat for wildlife. Popular on eco-conscious modern homes and commercial buildings.
              </p>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Pros & Cons</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-green-600 mb-4"><CheckCircle className="w-5 h-5 inline" /> Pros</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Excellent insulation</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Manages stormwater</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Reduces heat island effect</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Creates green space</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Improves air quality</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-4">✗ Cons</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>High installation cost</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Ongoing maintenance</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Very heavy</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Complex installation</span></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-2xl p-6 shadow-xl sticky top-4">
            <Leaf className="w-12 h-12 mx-auto mb-4 text-green-200" />
            <h3 className="text-2xl font-bold mb-4 text-center">Get Estimate</h3>
            <Link to={createPageUrl("AddressMethodSelector")} className="block w-full bg-white text-green-700 text-center py-3 rounded-lg font-bold">
              Measure - FREE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}