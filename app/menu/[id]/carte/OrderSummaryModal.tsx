import { BorderBeam } from "@/components/magicui/border-beam";
import BoxReveal from "@/components/magicui/box-reveal";
import { Button } from "@/components/ui/button";

interface OrderSummaryModalProps {
    userName: string;
    items: { name: string; quantity: number }[];
    onClose: () => void;
}

export default function OrderSummaryModal({ userName, items, onClose }: OrderSummaryModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-6 shadow-lg w-full max-w-md">
                <BorderBeam size={250} duration={12} delay={9} />
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                    <h2 className="text-2xl font-semibold mb-4 text-center">Récapitulatif de la commande</h2>
                </BoxReveal>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                    <p className="text-lg text-gray-700 mb-4">Votre nom : <span className="font-semibold">{userName}</span></p>
                </BoxReveal>
                <ul className="space-y-2 w-full">
                    {items.map((item, index) => (
                        <BoxReveal key={index} boxColor={"#f0f0f0"} duration={0.5}>
                            <li className="bg-gray-100 p-3 rounded-lg shadow-sm flex justify-between">
                                <span>{item.name} - {item.quantity}</span>
                            </li>
                        </BoxReveal>
                    ))}
                </ul>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                    <Button
                        onClick={onClose}
                        className="mt-6 w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Nouvelle commande
                    </Button>
                </BoxReveal>
            </div>
        </div>
    );
}
