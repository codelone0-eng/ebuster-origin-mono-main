import Silk from '@/components/Silk';

export const SilkBackground = () => {
  return (
    <>
      {/* Silk background - fixed для покрытия всего экрана */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk
          speed={5}
          scale={1}
          color="#7e7d82" // RGB(126, 125, 130)
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1] pointer-events-none" />
    </>
  );
};

