import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Download,
  BarChart3,
  TrendingUp,
  DollarSign,
  Star,
  MapPin,
  Calendar,
  Users,
  Award,
  Sparkles,
} from "lucide-react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import SEO from "../Component/SEO";
import DestinationCard from "../Component/DestinationCard";

const CompareDestinations = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [destinations, setDestinations] = useState(() => {
    // Get destinations from location state or localStorage
    const stateDests = location.state?.destinations;
    if (stateDests && Array.isArray(stateDests)) {
      return stateDests;
    }
    try {
      const saved = localStorage.getItem("triplink.comparison");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const comparisonData = useMemo(() => {
    if (destinations.length === 0) return null;

    const attributes = [
      {
        key: "name",
        label: "Destination",
        render: (d) => d.name,
        type: "text",
      },
      {
        key: "location",
        label: "Location",
        render: (d) => (d.city ? `${d.city}, ${d.country}` : d.country),
        type: "text",
      },
      {
        key: "category",
        label: "Category",
        render: (d) => d.category || "N/A",
        type: "text",
      },
      {
        key: "rating",
        label: "Rating",
        render: (d) => d.rating || 0,
        type: "number",
        format: (val) => val.toFixed(1),
        best: "highest",
      },
      {
        key: "price",
        label: "Price Range",
        render: (d) => {
          const vals = [d.priceMin, d.priceMax, d.price].filter(
            (v) => typeof v === "number"
          );
          return vals.length
            ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
            : null;
        },
        type: "number",
        format: (val) => (val ? `$${val.toLocaleString()}` : "N/A"),
        best: "lowest",
      },
      {
        key: "priceMin",
        label: "Min Price",
        render: (d) => d.priceMin || null,
        type: "number",
        format: (val) => (val ? `$${val.toLocaleString()}` : "N/A"),
        best: "lowest",
      },
      {
        key: "priceMax",
        label: "Max Price",
        render: (d) => d.priceMax || null,
        type: "number",
        format: (val) => (val ? `$${val.toLocaleString()}` : "N/A"),
        best: "lowest",
      },
      {
        key: "description",
        label: "Description",
        render: (d) => (d.description || "").substring(0, 100) + "...",
        type: "text",
      },
    ];

    // Calculate best values
    const bestValues = {};
    attributes.forEach((attr) => {
      if (attr.best) {
        const values = destinations
          .map((d) => attr.render(d))
          .filter((v) => v !== null && v !== undefined);
        if (values.length > 0) {
          if (attr.best === "highest") {
            bestValues[attr.key] = Math.max(...values);
          } else if (attr.best === "lowest") {
            bestValues[attr.key] = Math.min(...values);
          }
        }
      }
    });

    return { attributes, bestValues };
  }, [destinations]);

  const removeDestination = (id) => {
    const updated = destinations.filter((d) => d.id !== id);
    setDestinations(updated);
    localStorage.setItem("triplink.comparison", JSON.stringify(updated));
  };

  const exportComparison = () => {
    if (!comparisonData) return;

    let csv = "Attribute," + destinations.map((d) => d.name).join(",") + "\n";
    comparisonData.attributes.forEach((attr) => {
      const row = [attr.label];
      destinations.forEach((d) => {
        const value = attr.render(d);
        const formatted = attr.format ? attr.format(value) : value;
        row.push(formatted || "N/A");
      });
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `destination-comparison-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (destinations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        <SEO
          title="Compare Destinations - TripLink"
          description="Compare travel destinations side by side. Compare prices, ratings, and features to find your perfect destination."
        />
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
            <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Destinations to Compare
            </h2>
            <p className="text-gray-600 mb-6">
              Select destinations from the search page to compare them side by
              side.
            </p>
            <button
              onClick={() => navigate("/destinations")}
              className="btn-gradient px-6 py-3 rounded-lg text-white font-semibold"
            >
              Browse Destinations
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <SEO
        title={`Compare ${destinations.length} Destinations - TripLink`}
        description={`Compare ${destinations
          .map((d) => d.name)
          .join(
            ", "
          )} side by side. Compare prices, ratings, and features to find your perfect destination.`}
      />
      <Navbar />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold brand-gradient-text mb-2">
                  Compare Destinations
                </h1>
                <p className="text-gray-600">
                  Side-by-side comparison of {destinations.length} destination
                  {destinations.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportComparison}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Download size={18} />
                  Export CSV
                </button>
                <button
                  onClick={() => navigate("/destinations")}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Destination Cards Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map((dest) => (
                <div
                  key={dest.id}
                  className="relative border rounded-lg p-3 bg-gray-50"
                >
                  <button
                    onClick={() => removeDestination(dest.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex items-center gap-3">
                    {dest.image && (
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {dest.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {dest.city}, {dest.country}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 size={24} />
                Detailed Comparison
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900 border-b">
                      Attribute
                    </th>
                    {destinations.map((dest) => (
                      <th
                        key={dest.id}
                        className="px-6 py-4 text-left font-semibold text-gray-900 border-b min-w-[200px]"
                      >
                        <div className="flex items-center gap-2">
                          {dest.image && (
                            <img
                              src={dest.image}
                              alt={dest.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <span>{dest.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData?.attributes.map((attr, idx) => (
                    <tr
                      key={attr.key}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 border-b">
                        {attr.label}
                      </td>
                      {destinations.map((dest) => {
                        const value = attr.render(dest);
                        const formatted = attr.format
                          ? attr.format(value)
                          : value;
                        const isBest =
                          attr.best &&
                          comparisonData.bestValues[attr.key] === value;
                        return (
                          <td
                            key={dest.id}
                            className={`px-6 py-4 border-b ${
                              isBest ? "bg-green-50 font-semibold" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isBest && (
                                <Award className="text-green-600" size={16} />
                              )}
                              <span
                                className={
                                  isBest ? "text-green-700" : "text-gray-700"
                                }
                              >
                                {formatted || "N/A"}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Rating Comparison */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                Rating Comparison
              </h3>
              <div className="space-y-4">
                {destinations.map((dest) => {
                  const rating = dest.rating || 0;
                  const percentage = (rating / 5) * 100;
                  return (
                    <div key={dest.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {dest.name}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {rating.toFixed(1)}/5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Comparison */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="text-green-600" size={20} />
                Price Comparison
              </h3>
              <div className="space-y-4">
                {destinations.map((dest) => {
                  const vals = [
                    dest.priceMin,
                    dest.priceMax,
                    dest.price,
                  ].filter((v) => typeof v === "number");
                  const avgPrice = vals.length
                    ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
                    : 0;
                  const maxPrice = Math.max(
                    ...destinations.map((d) => {
                      const v = [d.priceMin, d.priceMax, d.price].filter(
                        (x) => typeof x === "number"
                      );
                      return v.length ? Math.max(...v) : 0;
                    })
                  );
                  const percentage =
                    maxPrice > 0 ? (avgPrice / maxPrice) * 100 : 0;
                  return (
                    <div key={dest.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {dest.name}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${avgPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recommendation Score */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="text-purple-600" size={20} />
              Recommendation Score
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {destinations.map((dest) => {
                const rating = dest.rating || 0;
                const priceScore = (() => {
                  const vals = [
                    dest.priceMin,
                    dest.priceMax,
                    dest.price,
                  ].filter((v) => typeof v === "number");
                  if (!vals.length) return 50;
                  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                  const allPrices = destinations
                    .map((d) => {
                      const v = [d.priceMin, d.priceMax, d.price].filter(
                        (x) => typeof x === "number"
                      );
                      return v.length
                        ? v.reduce((a, b) => a + b, 0) / v.length
                        : 0;
                    })
                    .filter((p) => p > 0);
                  const minP = Math.min(...allPrices);
                  const maxP = Math.max(...allPrices);
                  if (maxP === minP) return 50;
                  return ((maxP - avg) / (maxP - minP)) * 100;
                })();
                const score = Math.round(
                  (rating / 5) * 60 +
                    priceScore * 0.3 +
                    (dest.isFeatured ? 10 : 0)
                );
                return (
                  <div key={dest.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {dest.name}
                      </span>
                      <span className="text-2xl font-bold text-purple-600">
                        {score}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Rating: {((rating / 5) * 100).toFixed(0)}% | Price:{" "}
                      {priceScore.toFixed(0)}% | Featured:{" "}
                      {dest.isFeatured ? "Yes" : "No"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <div className="flex flex-wrap gap-4 justify-center">
              {destinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => navigate(`/destinations/${dest.id}`)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition font-semibold"
                >
                  View {dest.name} Details
                </button>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default CompareDestinations;
