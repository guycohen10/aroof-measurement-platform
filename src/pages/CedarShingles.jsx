import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function CedarShingles() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-amber-800 to-brown-900 text-white py-20" style={{background: 'linear-gradient(to bottom right, #92400e, #451a03)'}}>
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("RoofingTypesIndex")} className="text-amber-200 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-5xl font-bold mb-4">Cedar Shingles & Shakes</h1>
          <p className="text-xl text-amber-100">Natural wood beauty - rustic charm with 20-40 year lifespan</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-600">Price</div>
            <div className="text-xl font-bold text-amber-700">$7.00/sq ft</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Lifespan</div>
            <div className="text-xl font-bold">20-40 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-sm text-gray-600">Warranty</div>
            <div className="text-xl font-bold">20-30 years</div>
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
                Cedar shingles offer unmatched natural beauty with rustic charm. Naturally resistant to insects and decay, cedar weathers to a beautiful silver-gray patina. Popular for cottages, cabins, and traditional homes seeking authentic character.
              </p>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Pros & Cons</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-green-600 mb-4"><CheckCircle className="w-5 h-5 inline" /> Pros</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Natural beauty</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Insect resistant</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Natural insulator</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Eco-friendly</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-4">✗ Cons</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Requires maintenance</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Can rot/mold</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Fire rating issues</span></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="text-white rounded-2xl p-6 shadow-xl sticky top-4" style={{background: 'linear-gradient(to bottom right, #92400e, #78350f)'}}>
            <h3 className="text-2xl font-bold mb-4">Get Estimate</h3>
            <Link to={createPageUrl("AddressMethodSelector")} className="block w-full bg-white text-amber-800 text-center py-3 rounded-lg font-bold">
              Measure - FREE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}