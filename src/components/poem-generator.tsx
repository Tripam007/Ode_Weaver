'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generatePoemAction, refinePoemAction } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Leaf, Wand2, Sparkles, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from './ui/input';
import Image from 'next/image';

const poemFormSchema = z.object({
  prompt: z.string().min(10, { message: 'Carpe Diem! Seize the day with a prompt of at least 10 characters.' }),
  theme: z.enum(['Romantic', 'Naturalistic', 'Classic']),
  photoDataUri: z.string().optional(),
});

type PoemFormValues = z.infer<typeof poemFormSchema>;

type PoemState = {
  poem?: string;
  refinedPoem?: string;
}

export default function PoemGenerator() {
  const [poemState, setPoemState] = useState<PoemState>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PoemFormValues>({
    resolver: zodResolver(poemFormSchema),
    defaultValues: {
      prompt: '',
      theme: 'Romantic',
      photoDataUri: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue('photoDataUri', dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue('photoDataUri', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async (values: PoemFormValues) => {
    setIsGenerating(true);
    setPoemState({});
    const formData = new FormData();
    formData.append('prompt', values.prompt);
    formData.append('theme', values.theme);
    if (values.photoDataUri) {
      formData.append('photoDataUri', values.photoDataUri);
    }

    const result = await generatePoemAction(formData);
    
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Oh Captain, My Captain!",
        description: result.error,
      });
    } else {
      setPoemState({ poem: result.poem });
    }
    setIsGenerating(false);
  };

  const handleRefine = async () => {
    if (!poemState.poem) return;
    setIsRefining(true);
    const result = await refinePoemAction(poemState.poem);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: result.error,
      });
    } else {
      setPoemState(prev => ({ ...prev, refinedPoem: result.refinedPoem }));
    }
    setIsRefining(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
      <Card className="shadow-lg border-primary/20 bg-card">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-2xl text-accent">
            <Leaf className="w-6 h-6 text-primary" />
            <span>Weave Your Ode</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-lg text-accent/80">Your Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'A solitary boat adrift on a misty morning lake...'"
                        className="min-h-[120px] resize-none bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel className="font-bold text-lg text-accent/80">Inspire with an Image (Optional)</FormLabel>
                <FormControl>
                  <div>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full bg-background">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                </FormControl>
                {imagePreview && (
                  <div className="mt-4 relative">
                    <Image src={imagePreview} alt="Image preview" width={500} height={300} className="rounded-md object-cover w-full aspect-video" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleRemoveImage}>
                      <X className="h-4 w-4"/>
                    </Button>
                  </div>
                )}
              </FormItem>
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-lg text-accent/80">Choose a Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a theme..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Romantic">Romantic</SelectItem>
                        <SelectItem value="Naturalistic">Naturalistic</SelectItem>
                        <SelectItem value="Classic">Classic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isGenerating} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
                {isGenerating ? (
                  <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating... </>
                ) : (
                  <> <Wand2 className="mr-2 h-4 w-4" /> Generate Poem </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6 h-full">
        { isGenerating ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px] bg-card/80">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="font-headline text-xl text-muted-foreground">Weaving words...</p>
            </div>
          ) : poemState.poem ? (
          <Card className="shadow-lg border-primary/20 bg-card h-full flex flex-col">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="font-headline flex items-center gap-2 text-2xl text-accent">
                <Sparkles className="w-6 h-6 text-primary" />
                <span>Your Masterpiece</span>
              </CardTitle>
              <Button onClick={handleRefine} variant="secondary" disabled={isRefining || !!poemState.refinedPoem}>
                 {isRefining ? (
                  <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refining... </>
                 ) : (
                  <> <Sparkles className="mr-2 h-4 w-4" /> Refine </>
                 )}
              </Button>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="whitespace-pre-wrap font-body text-base leading-relaxed p-4 bg-background rounded-md h-full overflow-y-auto">
                {poemState.refinedPoem || poemState.poem}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px] bg-card/80">
            <p className="font-headline text-xl text-center text-muted-foreground">Your generated poem will appear here.</p>
          </div>
        )
        }
      </div>
    </div>
  );
}
