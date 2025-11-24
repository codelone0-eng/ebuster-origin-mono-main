import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/hooks/useLanguage";
import { HelpCircle, Mail } from "lucide-react";

export const FAQ = () => {
  const { t } = useLanguage();

  // Use translations for FAQs
  const faqs = t('faq.items');

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2d2d2d] mb-8">
            <HelpCircle className="h-4 w-4 text-[#808080]" />
            <span className="text-sm text-[#808080]">{t('faq.badge')}</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {t('faq.title')}
          </h2>
          
          <p className="text-xl text-[#808080] max-w-2xl mx-auto leading-relaxed">
            {t('faq.description')}
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-16">
          {(faqs as unknown as any[]).map((faq: any, index: number) => (
            <div 
              key={index}
              className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-200"
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={`item-${index}`} className="border-none">
                  <AccordionTrigger className="text-left hover:no-underline py-0 text-white">
                    <h3 className="text-lg font-semibold">
                      {faq.question}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-0">
                    <p className="text-[#808080] leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-white">
              {t('faq.cta.title')}
            </h3>
            <p className="text-[#808080] mb-6 max-w-xl mx-auto">
              {t('faq.cta.description')}
            </p>
            <div className="flex justify-center">
              <a 
                href="mailto:techsupport@ebuster.ru"
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#1f1f1f] border border-[#2d2d2d] hover:bg-[#2d2d2d] hover:border-blue-500/50 transition-all duration-200 group"
              >
                <Mail className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium text-white">techsupport@ebuster.ru</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};