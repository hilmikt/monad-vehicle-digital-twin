import { useWriteContract } from 'wagmi';
import { vehicleNftAbi, vehicleNftAddress } from './contracts';

export function useServiceLog() {
    const { writeContractAsync } = useWriteContract();

    const addServiceLog = async (tokenId: number, note: string) => {
        return writeContractAsync({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: 'addServiceRecord',
            args: [BigInt(tokenId), note],
        });
    };

    return { addServiceLog };
}
