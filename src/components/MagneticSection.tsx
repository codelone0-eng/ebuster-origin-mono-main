import React, { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  id
}) => {
  return (
    <section 
      id={id}
      className={`section min-h-[50vh] flex items-center justify-center px-4 py-6 ${className}`}
    >
      <div className="w-full max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
};

export default Section;
