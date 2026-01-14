import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle, Crown } from 'lucide-react';

export default function NaturalSlate() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("RoofingTypesIndex")} className="text-purple-200 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
            Natural Slate Roofing <Crown className="w-12 h-12 text-yellow-400" />
          </h1>
          <p className="text-xl text-purple-100">The ultimate in prestige - roofs lasting 75-200 years</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-600">Price</div>
            <div className="text-xl font-bold text-purple-600">$18.00/sq ft</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Lifespan</div>
            <div className="text-xl font-bold">75-200 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-sm text-gray-600">Warranty</div>
            <div className="text-xl font-bold">75-100+ years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⚙️</div>
            <div className="text-sm text-gray-600">Install</div>
            <div className="text-xl font-bold">Expert Only</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                Natural slate is the most prestigious roofing material available. Quarried from natural stone, each slate tile is unique. Slate roofs are found on castles, estates, and historic buildings worldwide - some lasting 200+ years. The ultimate investment in your home.
              </p>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Pros & Cons</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-green-600 mb-4"><CheckCircle className="w-5 h-5 inline" /> Pros</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>75-200 year lifespan</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Unmatched prestige</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Natural stone beauty</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Fireproof</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span>Increases home value</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-4">✗ Cons</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Very expensive</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Extremely heavy</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Requires expert installers</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span>Fragile when walked on</span></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl p-6 shadow-xl sticky top-4">
            <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-2xl font-bold mb-4 text-center">Premium Estimate</h3>
            <Link to={createPageUrl("AddressMethodSelector")} className="block w-full bg-white text-purple-600 text-center py-3 rounded-lg font-bold">
              Measure - FREE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}