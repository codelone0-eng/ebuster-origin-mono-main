import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/hooks/useLanguage";
import { Plus } from "lucide-react";

export const FAQ = () => {
  const { t } = useLanguage();

  const faqs = t('faq.items');

  return (
    <div className="space-y-3">
      {(faqs as unknown as any[]).map((faq: any, index: number) => (
        <div 
          key={index}
          className="rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-colors"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value={`item-${index}`} className="border-none">
              <AccordionTrigger className="text-left hover:no-underline py-0 text-white">
                <h3 className="text-base font-medium pr-4">
                  {faq.question}
                </h3>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-0">
                <p className="text-white/60 leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  );
};
