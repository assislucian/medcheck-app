import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuidesList } from '@/components/help/GuidesList';
import { VideosList } from '@/components/help/VideosList';
import { FAQSection } from '@/components/help/FAQSection';
import { guides, videos } from '@/data/helpGuides';
import { faqItems } from '@/data/helpFAQs';
import { SearchBar } from '@/components/help/SearchBar';
import { HelpCircle, BookOpen, Play, MessageCircle } from 'lucide-react';

const HelpPage = () => {
  const [activeTab, setActiveTab] = useState('guides');

  return (
    <MainLayout title="Central de Ajuda">
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
        <div className="px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-full border border-emerald-200/60">
              <HelpCircle className="h-6 w-6 text-emerald-700" />
              <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Suporte & Tutoriais
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-800 bg-clip-text text-transparent leading-tight">
                Central de Ajuda
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Encontre respostas para suas dúvidas sobre o MedCheck. Tutoriais, vídeos
                e guias práticos para otimizar sua experiência.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <SearchBar onSearch={(term) => console.log('Searching:', term)} />
            </div>
          </div>

          <section className="space-y-8">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl p-1">
                <Tabs
                  defaultValue={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full min-w-[600px]"
                >
                  <TabsList className="grid w-full grid-cols-3 bg-transparent">
                    <TabsTrigger
                      value="guides"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all duration-300"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Guias
                    </TabsTrigger>
                    <TabsTrigger
                      value="videos"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all duration-300"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Vídeos
                    </TabsTrigger>
                    <TabsTrigger
                      value="faq"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all duration-300"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      FAQ
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-8">
                    <TabsContent value="guides" className="space-y-8">
                      <GuidesList guides={guides} />
                    </TabsContent>

                    <TabsContent value="videos" className="space-y-8">
                      <VideosList videos={videos} />
                    </TabsContent>

                    <TabsContent value="faq" className="space-y-8">
                      <FAQSection items={faqItems} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpPage;
