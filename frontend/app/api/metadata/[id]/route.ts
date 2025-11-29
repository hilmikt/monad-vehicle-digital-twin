import { NextResponse } from 'next/server';

const sampleMetadata = [
    {
        name: "Tesla Model 3",
        description: "Standard Range Plus. Electric sedan with autopilot capabilities.",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
        model: "Model 3",
        year: "2024"
    },
    {
        name: "Porsche Taycan",
        description: "High-performance electric sports car. Turbo S configuration.",
        image: "https://images.unsplash.com/photo-1614200187524-dc41162f5263?auto=format&fit=crop&w=800&q=80",
        model: "Taycan",
        year: "2023"
    },
    {
        name: "Rivian R1T",
        description: "Electric adventure truck. Quad-Motor AWD.",
        image: "https://images.unsplash.com/photo-1669062334796-03915152a5c4?auto=format&fit=crop&w=800&q=80",
        model: "R1T",
        year: "2024"
    }
];

export async function GET(request: Request, { params }: { params: { id: string } }) {
    // In a real app, we might look up DB by ID.
    // Here we just rotate through samples based on ID to simulate variety.
    const id = Number(params.id);
    const index = id % sampleMetadata.length;
    const data = sampleMetadata[index];

    return NextResponse.json(data);
}
