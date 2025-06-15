import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/layout/Container';
import { Stack } from '@/components/ui/layout/Stack';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/data-display/Card';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-100 text-surface-900">
      <Container>
        <div className="py-8">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Game Night Concierge</h1>
              <p className="text-surface-600">Your ultimate board game companion</p>
            </div>
            <ThemeToggle />
          </header>

          <Stack spacing="xl">
            <section>
              <h2 className="text-2xl font-semibold mb-6">Welcome</h2>
              <p className="text-lg text-surface-700 mb-6">
                Game Night Concierge helps you organize perfect game nights by matching players with games 
                based on preferences, group size, and play time. Explore our demo pages to see the features in action.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6">Demo Pages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Component Library</CardTitle>
                    <CardDescription>
                      Explore our comprehensive UI component library with interactive examples
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/component-library">
                      <Button className="w-full">View Components</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Theme System</CardTitle>
                    <CardDescription>
                      See our theming system in action with color palettes and typography
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/theme-demo">
                      <Button variant="secondary" className="w-full">View Themes</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>API Demo</CardTitle>
                    <CardDescription>
                      Test our backend API endpoints and see the data structures
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/api-demo">
                      <Button variant="outline" className="w-full">View API</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data & Database Demo</CardTitle>
                    <CardDescription>
                      Database validation tool with real-time statistics, player profiles, and system health monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/data-demo">
                      <Button variant="default" className="w-full">View Data</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Smart Game Matching</h3>
                  <p className="text-surface-600">
                    Our algorithm considers player preferences, group size, available time, 
                    and game complexity to suggest the perfect games for your group.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Player Profiles</h3>
                  <p className="text-surface-600">
                    Track individual preferences, play history, and favorite games to 
                    improve recommendations over time.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Game Library</h3>
                  <p className="text-surface-600">
                    Browse and filter through an extensive collection of board games 
                    with detailed information and ratings.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Session Planning</h3>
                  <p className="text-surface-600">
                    Plan your game nights in advance with scheduling tools and 
                    automatic game suggestions based on attendees.
                  </p>
                </div>
              </div>
            </section>
          </Stack>
        </div>
      </Container>
    </div>
  );
} 