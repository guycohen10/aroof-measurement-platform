import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Home, ArrowLeft } from 'lucide-react';

export default function RoofingTypesIndex() {
  const materials = [
    { name: '3-Tab Asphalt', path: 'AsphaltShingles3Tab', price: '$3.50', life: '15-20 yrs', cat: 'Economy', emoji: '🏘️', desc: 'Most affordable option' },
    { name: 'Architectural Shingles', path: 'AsphaltShinglesArchitectural', price: '$4.50', life: '25-30 yrs', cat: 'Standard', emoji: '🏡', desc: 'Best value choice' },
    { name: 'Metal Standing Seam', path: 'MetalStandingSeam', price: '$9.00', life: '40-70 yrs', cat: 'Premium', emoji: '🏢', desc: 'Modern & durable' },
    { name: 'Metal Shingles', path: 'MetalShingles', price: '$8.00', life: '40-60 yrs', cat: 'Premium', emoji: '⚡', desc: 'Long-lasting metal' },
    { name: 'Clay Tile', path: 'ClayTile', price: '$12.00', life: '50-100 yrs', cat: 'Luxury', emoji: '🏛️', desc: 'Mediterranean style' },
    { name: 'Concrete Tile', path: 'ConcreteTile', price: '$10.00', life: '40-50 yrs', cat: 'Premium', emoji: '🏰', desc: 'Versatile & strong' },
    { name: 'Natural Slate', path: 'NaturalSlate', price: '$18.00', life: '75-200 yrs', cat: 'Luxury', emoji: '💎', desc: 'Ultimate prestige' },
    { name: 'Cedar Shingles', path: 'CedarShingles', price: '$7.00', life: '20-40 yrs', cat: 'Premium', emoji: '🌲', desc: 'Natural wood beauty' },
    { name: 'TPO Flat Roof', path: 'TPO', price: '$5.50', life: '15-20 yrs', cat: 'Standard', emoji: '📄', desc: 'Energy efficient' },
    { name: 'EPDM Rubber', path: 'EPDM', price: '$5.00', life: '20-25 yrs', cat: 'Economy', emoji: '⚫', desc: 'Reliable flat roof' },
    { name: 'Composite/Synthetic', path: 'Composite', price: '$8.50', life: '30-50 yrs', cat: 'Premium', emoji: '🔬', desc: 'Advanced materials' },
    { name: 'Solar Tiles', path: 'SolarTiles', price: '$25.00', life: '25-30 yrs', cat: 'Luxury', emoji: '☀️', desc: 'Power generation' },
    { name: 'Green/Living Roof', path: 'GreenRoof', price: '$15.00', life: '30-50 yrs', cat: 'Luxury', emoji: '🌿', desc: 'Eco-friendly' }
  ];

  const getCatColor = (cat) => {
    return cat === 'Economy' ? 'bg-blue-100 text-blue-800' :
           cat === 'Standard' ? 'bg-green-100 text-green-800' :
           cat === 'Premium' ? 'bg-purple-100 text-purple-800' :
           'bg-amber-100 text-amber-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("Homepage")} className="text-blue-200 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">Roofing Material Guide</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Compare 13 roofing materials - find your perfect roof
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((m) => (
            <Link
              key={m.path}
              to={createPageUrl(m.path)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{m.emoji}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCatColor(m.cat)}`}>
                    {m.cat}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                  {m.name}
                </h3>
                
                <p className="text-gray-600 mb-4">{m.desc}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="font-bold text-blue-600">{m.price}/sq ft</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Lifespan</span>
                    <span className="font-bold">{m.life}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <span className="text-blue-600 font-semibold group-hover:underline">
                    Learn More →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get instant measurement and pricing for any material
          </p>
          <Link
            to={createPageUrl("AddressMethodSelector")}
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50"
          >
            Measure My Roof - FREE
          </Link>
        </div>
      </div>
    </div>
  );
}