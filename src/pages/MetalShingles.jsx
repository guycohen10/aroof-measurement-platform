import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function MetalShingles() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("RoofingTypesIndex")} className="text-gray-300 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-5xl font-bold mb-4">Metal Shingles/Tiles</h1>
          <p className="text-xl text-gray-200 max-w-3xl">
            Traditional shingle look with metal durability - 40+ year lifespan
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-600">Price</div>
            <div className="text-xl font-bold">$8.00/sq ft</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Lifespan</div>
            <div className="text-xl font-bold">40-60 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-sm text-gray-600">Warranty</div>
            <div className="text-xl font-bold">40-50 years</div>
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
                Metal shingles combine the classic aesthetic of traditional roofing with the longevity and performance of metal. Designed to mimic wood shakes, slate, or asphalt shingles, they offer versatile styling options while providing 40-60 years of reliable protection.
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
                    <li className="flex gap-2"><span className="text-green-500">•</span><span className="text-gray-700">40-60 year lifespan</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span className="text-gray-700">Traditional appearance</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span className="text-gray-700">Lightweight & durable</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span className="text-gray-700">Fire & wind resistant</span></li>
                    <li className="flex gap-2"><span className="text-green-500">•</span><span className="text-gray-700">Energy efficient</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-4">✗ Cons</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><span className="text-red-500">•</span><span className="text-gray-700">Higher initial cost</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span className="text-gray-700">Can dent from hail</span></li>
                    <li className="flex gap-2"><span className="text-red-500">•</span><span className="text-gray-700">Specialized installers</span></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-2xl p-6 shadow-xl sticky top-4">
              <h3 className="text-2xl font-bold mb-4">Get Free Estimate</h3>
              <Link to={createPageUrl("AddressMethodSelector")} className="block w-full bg-white text-gray-800 text-center py-3 rounded-lg font-bold hover:bg-gray-50">
                Measure Now - FREE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}