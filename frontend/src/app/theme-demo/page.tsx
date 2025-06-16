import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function ThemeDemo() {
  return (
    <div className="min-h-screen bg-surface-100 text-surface-900">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Theme System Demo</h1>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <section className="space-y-8">
          {/* Color Palette */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(weight => (
                <div key={weight} className="space-y-2">
                  <div className={`h-20 rounded-lg bg-surface-${weight}`} />
                  <p className="text-sm font-mono">surface-{weight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Typography</h2>
            <div className="space-y-4">
              <p className="text-4xl">4XL Text Size</p>
              <p className="text-3xl">3XL Text Size</p>
              <p className="text-2xl">2XL Text Size</p>
              <p className="text-xl">XL Text Size</p>
              <p className="text-lg">LG Text Size</p>
              <p className="text-base">Base Text Size</p>
              <p className="text-sm">SM Text Size</p>
              <p className="text-xs">XS Text Size</p>
            </div>
          </div>

          {/* Buttons */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button size="sm">Small Button</Button>
              <Button size="default">Default Size</Button>
              <Button size="lg">Large Button</Button>
            </div>
          </div>

          {/* Spacing */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Spacing Scale</h2>
            <div className="flex items-end gap-2">
              {[1, 2, 3, 4, 6, 8, 12, 16].map(space => (
                <div key={space} className={`w-${space} h-${space} bg-primary rounded`}>
                  <span className="text-xs mt-2 block">{space}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
