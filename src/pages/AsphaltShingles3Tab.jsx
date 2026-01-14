import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function AsphaltShingles3Tab() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("RoofingTypesIndex")} className="text-blue-200 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to All Materials
          </Link>
          <h1 className="text-5xl font-bold mb-4">3-Tab Asphalt Shingles</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            The most affordable and widely-used roofing material in America - proven reliability at an unbeatable price
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-600">Price Range</div>
            <div className="text-xl font-bold text-blue-600">$3.50/sq ft</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Lifespan</div>
            <div className="text-xl font-bold text-blue-600">15-20 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-sm text-gray-600">Warranty</div>
            <div className="text-xl font-bold text-blue-600">15-20 years</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">⚙️</div>
            <div className="text-sm text-gray-600">Difficulty</div>
            <div className="text-xl font-bold text-blue-600">Easy</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                3-tab asphalt shingles are the most economical roofing option available, making them the go-to choice for budget-conscious homeowners across America. Named for their three-tab design, these shingles create a uniform, flat appearance that has been protecting homes for decades.
              </p>
              <p className="text-gray-700 leading-relaxed">
                While they may not have the dimensional look of architectural shingles, 3-tab asphalt shingles offer excellent value, reliable weather protection, and straightforward installation. They're perfect for rental properties, budget renovations, or any project where cost is the primary concern without sacrificing quality.
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
                      <span className="text-gray-700">Most affordable roofing option</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">Quick installation saves labor costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">Lightweight design</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">Wide color availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">Fire resistant Class A rating</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">Easy repairs</span>
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
                      <span className="text-gray-700">Shorter 15-20 year lifespan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-gray-700">Flat appearance - less curb appeal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-gray-700">More wind damage susceptible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-gray-700">Lower resale value impact</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Best For</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl">🏘️</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Rental Properties</h4>
                    <p className="text-sm text-gray-600">Maximize ROI with low costs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl">💵</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Budget Projects</h4>
                    <p className="text-sm text-gray-600">Quality on a tight budget</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl">🏠</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Temporary Solutions</h4>
                    <p className="text-sm text-gray-600">Planning to sell soon</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl">🌤️</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Mild Climates</h4>
                    <p className="text-sm text-gray-600">Moderate weather areas</p>
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
                      <th className="text-right p-3 font-semibold">Cost per Sq Ft</th>
                      <th className="text-right p-3 font-semibold">1,500 Sq Ft Roof</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 text-gray-700">Materials</td>
                      <td className="p-3 text-right font-medium">$1.50</td>
                      <td className="p-3 text-right font-medium">$2,250</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-gray-700">Labor</td>
                      <td className="p-3 text-right font-medium">$1.50</td>
                      <td className="p-3 text-right font-medium">$2,250</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-gray-700">Underlayment</td>
                      <td className="p-3 text-right font-medium">$0.50</td>
                      <td className="p-3 text-right font-medium">$750</td>
                    </tr>
                    <tr className="bg-blue-50 font-bold">
                      <td className="p-3">Total Installed</td>
                      <td className="p-3 text-right text-blue-600">$3.50</td>
                      <td className="p-3 text-right text-blue-600">$5,250</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-xl sticky top-4">
              <h3 className="text-2xl font-bold mb-4">Get Your Free Estimate</h3>
              <p className="mb-6 text-blue-100">
                See exact pricing for 3-Tab Shingles on your roof
              </p>
              <Link
                to={createPageUrl("AddressMethodSelector")}
                className="block w-full bg-white text-blue-600 text-center py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
              >
                Measure My Roof - FREE
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Similar Materials</h3>
              <div className="space-y-3">
                <Link to={createPageUrl("AsphaltShinglesArchitectural")} className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50">
                  <div className="font-semibold">Architectural Shingles</div>
                  <div className="text-sm text-gray-600">Better aesthetics, longer life</div>
                </Link>
                <Link to={createPageUrl("EPDM")} className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50">
                  <div className="font-semibold">EPDM Rubber</div>
                  <div className="text-sm text-gray-600">Similar price</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}