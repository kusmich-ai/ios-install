'use client';
import SomaticFlowAnimation from '@/components/SomaticFlowAnimation';

export default function TestSomatic() {
  return (
    <SomaticFlowAnimation 
      onComplete={() => console.log('Practice complete')} 
    />
  );
}
