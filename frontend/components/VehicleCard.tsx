import Link from "next/link";
import { formatEther } from "viem";

interface VehicleCardProps {
    tokenId: number;
    model: string;
    year: number;
    price: bigint;
    deliveryStage: number;
    imageUrl: string;
}

const getStageLabel = (stage: number) => {
    switch (stage) {
        case 0: return "Not Started";
        case 1: return "In Transit";
        case 2: return "Delivered";
        default: return "Unknown";
    }
};

const getStageColor = (stage: number) => {
    switch (stage) {
        case 0: return "bg-gray-100 text-gray-800";
        case 1: return "bg-yellow-100 text-yellow-800";
        case 2: return "bg-green-100 text-green-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

export default function VehicleCard({
    tokenId,
    model,
    year,
    price,
    deliveryStage,
    imageUrl,
}: VehicleCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="h-48 w-full bg-gray-200 relative">
                {/* Placeholder for image if not provided or error */}
                {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={model} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
            </div>
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            {year} {model}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Token ID: {tokenId}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(deliveryStage)}`}>
                        {getStageLabel(deliveryStage)}
                    </span>
                </div>
                <div className="mt-4 flex items-baseline text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatEther(price)} ETH
                </div>
                <div className="mt-6">
                    <Link
                        href={`/vehicle/${tokenId}`}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
