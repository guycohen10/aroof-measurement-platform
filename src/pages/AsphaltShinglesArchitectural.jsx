import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function AsphaltShinglesArchitectural() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-green-900 to-green-800 text-white py-20">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("RoofingTypesIndex")} className="text-green-200 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to All Materials
          </Link>
          <h1 className="text-5xl font-bold mb-4">Architectural Asphalt Shingles</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            America's #1 choice - the perfect balance of beauty, durability, and value
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-600">Price Range</div>
            <div className="text-xl font-bold text-green-600">$4.50/sq ft</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Lifespan</div>
            <div className="text-xl font-bold text-green-600">25-30 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-sm text-gray-600">Warranty</div>
            <div className="text-xl font-bold text-green-600">25-30 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⚙️</div>
            <div className="text-sm text-gray-600">Difficulty</div>
            <div className="text-xl font-bold text-green-600">Easy</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Architectural shingles, also known as dimensional or laminated shingles, represent the gold standard in asphalt roofing. With their multi-layered construction, they create a rich, dimensional appearance that mimics the look of more expensive materials like wood shakes or slate.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Used on over 80% of new construction homes, architectural shingles offer superior durability, enhanced curb appeal, and exceptional weather resistance - the smart choice for homeowners who want their roof to last decades.
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
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">Beautiful dimensional appearance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">25-30 year lifespan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">Superior wind resistance (110-130 mph)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">Increases home value</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">Wide variety of styles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">Class A fire rating</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                    <span>✗</span> Disadvantages
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-gray-700">25-50% more than 3-tab</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-gray-700">Heavier weight</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-gray-700">More expensive repairs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Best For</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl">🏡</div>
                  <div>
                    <h4 className="font-bold">Primary Residences</h4>
                    <p className="text-sm text-gray-600">Long-term homeowners</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl">📈</div>
                  <div>
                    <h4 className="font-bold">Resale Value</h4>
                    <p className="text-sm text-gray-600">Maximize curb appeal</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl">🌪️</div>
                  <div>
                    <h4 className="font-bold">Storm-Prone Areas</h4>
                    <p className="text-sm text-gray-600">High wind protection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl">⚖️</div>
                  <div>
                    <h4 className="font-bold">Value Seekers</h4>
                    <p className="text-sm text-gray-600">Best cost/quality balance</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Cost Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 font-semibold">Component</th>
                      <th className="text-right p-3 font-semibold">1,500 Sq Ft Roof</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 text-gray-700">Materials</td>
                      <td className="p-3 text-right font-medium">$3,000</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-gray-700">Labor</td>
                      <td className="p-3 text-right font-medium">$2,250</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-gray-700">Underlayment</td>
                      <td className="p-3 text-right font-medium">$1,000</td>
                    </tr>
                    <tr className="bg-green-50 font-bold">
                      <td className="p-3">Total</td>
                      <td className="p-3 text-right text-green-600">$6,750</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-6 shadow-xl sticky top-4">
              <h3 className="text-2xl font-bold mb-4">Get Free Estimate</h3>
              <p className="mb-6 text-green-100">Exact pricing for your roof</p>
              <Link to={createPageUrl("AddressMethodSelector")} className="block w-full bg-white text-green-600 text-center py-3 rounded-lg font-bold hover:bg-green-50">
                Measure Now - FREE
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Similar Materials</h3>
              <div className="space-y-3">
                <Link to={createPageUrl("AsphaltShingles3Tab")} className="block p-3 bg-gray-50 rounded-lg hover:bg-green-50">
                  <div className="font-semibold">3-Tab Asphalt</div>
                  <div className="text-sm text-gray-600">Budget option</div>
                </Link>
                <Link to={createPageUrl("Composite")} className="block p-3 bg-gray-50 rounded-lg hover:bg-green-50">
                  <div className="font-semibold">Composite</div>
                  <div className="text-sm text-gray-600">Premium synthetic</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}