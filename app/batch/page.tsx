import React from 'react';
import { Metadata } from 'next';
import { BatchProcessor } from '@/components/BatchProcessor';
import { SeoContentSection } from '@/components/SeoContentSection';

export const metadata: Metadata = {
  title: 'Batch AI Watermark Remover | Clean Bulk Images - Unmask AI',
  description:
    'Batch process and remove AI watermarks from multiple images and video frames simultaneously in your browser. Download all cleaned files in one click as a ZIP file.',
};

export default function BatchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <section className="rounded-3xl border border-surface-border bg-surface/70 p-4 sm:p-8 backdrop-blur-xl shadow-2xl">
        <BatchProcessor />
      </section>

      <SeoContentSection />
    </div>
  );
}
