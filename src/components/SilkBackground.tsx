import Silk from '@/components/Silk';

export const SilkBackground = () => {
  return (
    <>
      {/* Silk background - fixed для покрытия всего экрана */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk
          speed={5}
          scale={1}
          color="#ffffff"
          noiseIntensity={4.3}
          rotation={0}
        />
      </div>
      
      {/* Gradient overlay - затемнение для темного фона */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/95 z-[1] pointer-events-none" />
    </>
  );
};

