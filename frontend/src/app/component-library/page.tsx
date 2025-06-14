import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  FormField,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Avatar,
  Alert,
  AlertTitle,
  AlertDescription,
  Loading,
  Container,
  Stack,
} from '@/components/ui';

export default function ComponentLibraryDemo() {
  const radioOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <div className="min-h-screen bg-surface-100 text-surface-900">
      <Container>
        <div className="py-8">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Component Library</h1>
              <p className="text-surface-600">
                Game Night Concierge UI Component Library Demo
              </p>
            </div>
            <ThemeToggle />
          </header>

          <Stack spacing="xl">
            {/* Form Components */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Form Components</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Input Components</CardTitle>
                    <CardDescription>Text inputs with validation states</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="default">
                      <FormField label="Default Input" htmlFor="input1">
                        <Input id="input1" placeholder="Enter text..." />
                      </FormField>
                      
                      <FormField label="Error State" htmlFor="input2" error="This field is required">
                        <Input id="input2" error placeholder="Error input..." />
                      </FormField>
                      
                      <FormField label="Success State" htmlFor="input3">
                        <Input id="input3" success placeholder="Success input..." />
                      </FormField>
                      
                      <FormField label="Textarea" htmlFor="textarea1">
                        <Textarea id="textarea1" placeholder="Enter longer text..." />
                      </FormField>
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Selection Components</CardTitle>
                    <CardDescription>Dropdowns, checkboxes, and radio buttons</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="default">
                      <FormField label="Select Dropdown" htmlFor="select1">
                        <Select id="select1" placeholder="Choose an option">
                          <option value="1">Option 1</option>
                          <option value="2">Option 2</option>
                          <option value="3">Option 3</option>
                        </Select>
                      </FormField>
                      
                      <FormField label="Checkbox Options">
                        <Stack spacing="sm">
                          <Checkbox id="check1" label="Option 1" />
                          <Checkbox id="check2" label="Option 2" />
                          <Checkbox id="check3" label="Option 3" disabled />
                        </Stack>
                      </FormField>
                      
                      <FormField label="Radio Group">
                        <RadioGroup
                          name="demo-radio"
                          options={radioOptions}
                          defaultValue="option1"
                        />
                      </FormField>
                    </Stack>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Data Display Components */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Data Display</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card interactive>
                  <CardHeader>
                    <CardTitle>Interactive Card</CardTitle>
                    <CardDescription>This card is clickable</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Click anywhere on this card to see the hover effect.</p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Action</Button>
                  </CardFooter>
                </Card>

                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Elevated Card</CardTitle>
                    <CardDescription>With shadow elevation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <Avatar src="/api/placeholder/40/40" alt="User" fallback="JD" />
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-surface-600">Player</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardHeader>
                    <CardTitle>Badges & Status</CardTitle>
                    <CardDescription>Various badge styles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="sm">
                      <div className="flex flex-wrap gap-2">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="error">Error</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge size="sm">Small</Badge>
                        <Badge size="default">Default</Badge>
                        <Badge size="lg">Large</Badge>
                      </div>
                    </Stack>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Feedback Components */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Feedback</h2>
              <Stack spacing="default">
                <Alert>
                  <AlertTitle>Default Alert</AlertTitle>
                  <AlertDescription>
                    This is a default alert with an info icon.
                  </AlertDescription>
                </Alert>

                <Alert variant="success">
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    Your action was completed successfully.
                  </AlertDescription>
                </Alert>

                <Alert variant="warning">
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Please review your input before proceeding.
                  </AlertDescription>
                </Alert>

                <Alert variant="error">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Something went wrong. Please try again.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>Loading States</CardTitle>
                    <CardDescription>Different loading indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <Loading size="sm" text="Small" />
                      </div>
                      <div className="text-center">
                        <Loading size="default" text="Default" />
                      </div>
                      <div className="text-center">
                        <Loading size="lg" text="Large" />
                      </div>
                      <div className="text-center">
                        <Loading variant="dots" text="Dots" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Stack>
            </section>

            {/* Button Variants */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Button Variants & Sizes</CardTitle>
                  <CardDescription>All available button styles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Stack spacing="default">
                    <div>
                      <h4 className="font-medium mb-3">Variants</h4>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="default">Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button disabled>Disabled</Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Sizes</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                      </div>
                    </div>
                  </Stack>
                </CardContent>
              </Card>
            </section>

            {/* Layout Components */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Layout</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Stack Component</CardTitle>
                  <CardDescription>Flexible spacing and alignment</CardDescription>
                </CardHeader>
                <CardContent>
                  <Stack spacing="default">
                    <div>
                      <h4 className="font-medium mb-3">Vertical Stack (default)</h4>
                      <Stack spacing="sm" className="bg-surface-200 p-4 rounded">
                        <div className="bg-primary text-white p-2 rounded text-center">Item 1</div>
                        <div className="bg-primary text-white p-2 rounded text-center">Item 2</div>
                        <div className="bg-primary text-white p-2 rounded text-center">Item 3</div>
                      </Stack>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Horizontal Stack</h4>
                      <Stack direction="horizontal" spacing="sm" className="bg-surface-200 p-4 rounded">
                        <div className="bg-primary text-white p-2 rounded text-center">Item 1</div>
                        <div className="bg-primary text-white p-2 rounded text-center">Item 2</div>
                        <div className="bg-primary text-white p-2 rounded text-center">Item 3</div>
                      </Stack>
                    </div>
                  </Stack>
                </CardContent>
              </Card>
            </section>
          </Stack>
        </div>
      </Container>
    </div>
  );
} 