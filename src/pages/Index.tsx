import { useState } from 'react';
import { Leaf, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ImagePicker } from '@/components/ImagePicker';
import { ResultCard } from '@/components/ResultCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { HelpDialog } from '@/components/HelpDialog';
import { PredictionResult, ProcessingState } from '@/types';
import { predictDisease, isDemoMode } from '@/utils/apiUtils';
import durianLeafLogo from '@/assets/durian-leaf-logo.png';

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  const handleImageSelect = (base64: string, file: File) => {
    setSelectedImage(base64);
    setSelectedFile(file);
    setResult(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setProcessingState('idle');
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setProcessingState('processing');
    
    try {
      const prediction = await predictDisease(selectedImage);
      setResult(prediction);
      setProcessingState('success');
      
      toast({
        title: "วิเคราะห์สำเร็จ",
        description: "ได้ผลการวินิจฉัยแล้ว",
      });
      
    } catch (error: any) {
      setProcessingState('error');
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถวิเคราะห์ภาพได้",
        variant: "destructive"
      });
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;
    
    // Simple implementation - in real app, generate PDF
    toast({
      title: "ดาวน์โหลด",
      description: "ฟีเจอร์นี้จะพร้อมใช้งานเร็วๆ นี้",
    });
  };

  const isAnalyzeDisabled = !selectedImage || processingState === 'processing';

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={durianLeafLogo} 
                alt="DurianLeaf AI" 
                className="w-10 h-10 rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">DurianLeaf AI</h1>
                <p className="text-xs text-muted-foreground">วินิจฉัยโรคใบทุเรียน</p>
              </div>
            </div>
            <HelpDialog />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Demo Mode Banner */}
        {isDemoMode() && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium text-sm">
                โหมดทดสอบ - ใช้ข้อมูลจำลองเพื่อเดโม UI
              </span>
            </div>
          </div>
        )}
        
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            วินิจฉัยโรคใบทุเรียนด้วย AI
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            อัปโหลดภาพใบทุเรียน หรือถ่ายภาพด้วยกล้อง แล้ว AI จะช่วยวิเคราะห์ และบอกผลการวินิจฉัยโรคภายในไม่กี่วินาที
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Image Input */}
          <div className="space-y-4">
            <ImagePicker
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onClearImage={handleClearImage}
              disabled={processingState === 'processing'}
            />
            
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzeDisabled}
              className="w-full gap-2 bg-gradient-primary hover:opacity-90 text-lg py-6"
              size="lg"
            >
              <Leaf className="w-5 h-5" />
              {processingState === 'processing' ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ภาพ'}
            </Button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {processingState === 'processing' && (
              <LoadingSpinner />
            )}
            
            {processingState === 'success' && result && (
              <ResultCard 
                result={result}
                onDownloadReport={handleDownloadReport}
              />
            )}
            
            {processingState === 'idle' && !selectedImage && (
              <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                <div className="text-center text-muted-foreground">
                  <Leaf className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">พร้อมวิเคราะห์</p>
                  <p className="text-sm">เลือกภาพใบทุเรียนเพื่อเริ่มต้น</p>
                </div>
              </div>
            )}

            {selectedImage && processingState === 'idle' && (
              <div className="flex items-center justify-center h-64 bg-primary/5 rounded-lg border-2 border-dashed border-primary/20">
                <div className="text-center text-primary">
                  <Sparkles className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-lg font-medium mb-2">พร้อมวิเคราะห์</p>
                  <p className="text-sm text-muted-foreground">กดปุ่มวิเคราะห์ภาพเพื่อเริ่มต้น</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            💡 เพื่อผลลัพธ์ที่แม่นยำ แนะนำให้ถ่ายภาพในแสงสว่าง และเห็นใบทุเรียนชัดเจน
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;