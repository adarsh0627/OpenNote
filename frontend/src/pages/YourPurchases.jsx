import React, { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { getMyPurchases } from "../api/apis";
import PurchasedNoteCard from "../components/cards/PurchaseNoteCard";

const YourPurchases = () => {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      const data = await getMyPurchases();
      setPurchases(data.purchases); // ✅ FIX
    };
    fetchPurchases();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="px-8 py-6">
        <h2 className="text-xl font-semibold mb-6">
          Your Purchases
        </h2>

        {purchases.length === 0 ? (
          <p className="text-gray-600">No purchases yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {purchases.map((purchase) => (
              <PurchasedNoteCard
                key={purchase._id}
                note={purchase.note} // ✅ important
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YourPurchases;
