import { DollarSign, Users, AlertCircle, Boxes } from "lucide-react";

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-4 rounded shadow flex items-center gap-4">
      <div className="p-3 bg-red-100 text-red-700 rounded">
        {icon}
      </div>
      <div>
        {/* Title - bold and slightly larger */}
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {/* Value - bold, black, and larger */}
        <p className="text-2xl font-bold text-black">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;