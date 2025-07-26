"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Wifi,
  Bluetooth,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from "lucide-react";

import { suggestStrongPassword } from "@/ai/flows/suggest-strong-password";

const formSchema = z.object({
  ssid: z.string().min(1, "SSID is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  device: z.string().min(1, "Please select a device."),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formDataToSend, setFormDataToSend] = useState<FormData | null>(null);


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ssid: "",
      password: "",
      device: "",
    },
  });

  useEffect(() => {
    if (isSending && formDataToSend) {
      const timer = setTimeout(() => {
        const isSuccess = Math.random() > 0.3; // Simulate success/failure
        if (isSuccess) {
          toast({
            title: "Success!",
            description: `WiFi credentials sent to ${formDataToSend.device}.`,
          });
          form.reset();
        } else {
          toast({
            variant: "destructive",
            title: "Failed to Send",
            description: `Could not establish a connection to ${formDataToSend.device}.`,
          });
        }
        setIsSending(false);
        setFormDataToSend(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSending, formDataToSend, toast, form]);


  const handleGeneratePassword = async () => {
    setIsGeneratingPassword(true);
    try {
      const result = await suggestStrongPassword({});
      if (result && result.password) {
        form.setValue("password", result.password, { shouldValidate: true });
        toast({
          title: "Password Generated",
          description: "A new strong password has been generated.",
        });
      }
    } catch (error) {
      console.error("Password generation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate a password. Please try again.",
      });
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  const onSubmit = (values: FormData) => {
    setIsSending(true);
    setFormDataToSend(values);
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <div className="bg-primary rounded-full p-4">
                <Wifi className="h-8 w-8 text-primary-foreground" />
             </div>
          </div>
          <CardTitle className="text-3xl font-headline">WiFi Connector</CardTitle>
          <CardDescription className="text-muted-foreground">
            Send WiFi credentials to your Raspberry Pi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ssid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WiFi Network (SSID)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g., MyHomeWiFi" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Password</FormLabel>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={handleGeneratePassword}
                        disabled={isGeneratingPassword}
                        className="h-auto p-0 text-primary hover:text-primary/80 font-semibold"
                      >
                        {isGeneratingPassword ? (
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                           <Sparkles className="mr-1 h-4 w-4 text-accent" />
                        )}
                        {isGeneratingPassword ? 'Generating...' : 'Suggest Password'}
                      </Button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter or generate a password"
                          {...field}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground hover:bg-transparent"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="device"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bluetooth Device</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <Bluetooth className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select a paired device" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RPi">RPi</SelectItem>
                        <SelectItem value="My Laptop">My Laptop</SelectItem>
                        <SelectItem value="Smart TV">Smart TV</SelectItem>
                        <SelectItem value="Bluetooth Speaker">Bluetooth Speaker</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full !mt-8 bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-6 text-base rounded-lg" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Credentials"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
