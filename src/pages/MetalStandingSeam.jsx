import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function MetalStandingSeam() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("RoofingTypesIndex")} className="text-slate-300 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to All Materials
          </Link>
          <h1 className="text-5xl font-bold mb-4">Metal Standing Seam Roofing</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Modern, energy-efficient roofing that lasts 50+ years with minimal maintenance
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-600">Price</div>
            <div className="text-xl font-bold text-slate-600">$9.00/sq ft</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Lifespan</div>
            <div className="text-xl font-bold text-slate-600">40-70 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-sm text-gray-600">Warranty</div>
            <div className="text-xl font-bold text-slate-600">40-50 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⚙️</div>
            <div className="text-sm text-gray-600">Install</div>
            <div className="text-xl font-bold text-slate-600">Complex</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Standing seam metal roofing represents the pinnacle of modern roofing. Characterized by raised vertical seams, this system creates a sleek look while providing unmatched durability and weather protection.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Made from steel, aluminum, or zinc with concealed fasteners, standing seam roofs eliminate exposed screws and can literally last a lifetime.
              </p>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Pros & Cons</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Advantages
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2"><span className="text-green-500">•</span><span className="text-gray-700">50-70 year lifespan</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-500">•</span><span className="text-gray-700">Energy efficient (reflects heat)</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-500">•</span><span className="text-gray-700">Sleek modern aesthetic</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-500">•</span><span className="text-gray-700">Extremely low maintenance</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-500">•</span><span className="text-gray-700">140+ mph wind resistance</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-500">•</span><span className="text-gray-700">100% recyclable</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-500">•</span><span className="text-gray-700">Lightweight</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-4">✗ Disadvantages</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2"><span className="text-red-500">•</span><span className="text-gray-700">High upfront cost</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-500">•</span><span className="text-gray-700">Specialized installation</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-500">•</span><span className="text-gray-700">Can be noisy in rain</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-500">•</span><span className="text-gray-700">Modern look doesn't suit all homes</span></li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Best For</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl">🏠</div>
                  <div><h4 className="font-bold">Modern Homes</h4><p className="text-sm text-gray-600">Contemporary design</p></div>
                </div>
                <div className="flex gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl">🌞</div>
                  <div><h4 className="font-bold">Hot Climates</h4><p className="text-sm text-gray-600">Heat reflection</p></div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-2xl p-6 shadow-xl sticky top-4">
              <h3 className="text-2xl font-bold mb-4">Get Free Estimate</h3>
              <p className="mb-6 text-slate-200">Exact pricing for your roof</p>
              <Link to={createPageUrl("AddressMethodSelector")} className="block w-full bg-white text-slate-800 text-center py-3 rounded-lg font-bold hover:bg-slate-50">
                Measure Now - FREE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}