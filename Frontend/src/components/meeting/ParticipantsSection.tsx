
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Scale, User, Users, Search, Check } from "lucide-react";
import { Control } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { auth } from "@/services/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Import the formSchema type
import { meetingFormSchema } from "./schema";

type FormValues = z.infer<typeof meetingFormSchema>;

interface ParticipantsSectionProps {
  control: Control<FormValues>;
  defaultJudgeEmail: string;
}

const ParticipantsSection = ({ control, defaultJudgeEmail }: ParticipantsSectionProps) => {
  const [lawyers, setLawyers] = useState<{ fullName: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const data = await auth.getLawyers();
        setLawyers(data);
      } catch (error) {
        console.error("Failed to fetch lawyers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyers();
  }, []);

  return (
    <div className="border-t border-border/50 my-6 pt-6">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <User className="h-5 w-5 text-primary" /> 
        Participants
      </h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="glass p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Judge</h4>
            </div>
            <FormField
              control={control}
              name="judgeEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      {...field}
                      className="input-focus-ring"
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Lawyers</h4>
            </div>
            <div className="space-y-4">
              {[1, 2].map((num) => (
                <FormField
                  key={num}
                  control={control}
                  name={`lawyer${num}Email` as any}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Lawyer {num} Email</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value || "Select registered lawyer email..."}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                          <Command>
                            <CommandInput placeholder="Search lawyers..." />
                            <CommandEmpty>No lawyer found. You can still type custom email below.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {lawyers.map((lawyer) => (
                                  <CommandItem
                                    value={lawyer.email}
                                    key={lawyer.email}
                                    onSelect={() => {
                                      field.onChange(lawyer.email);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        lawyer.email === field.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{lawyer.fullName}</span>
                                      <span className="text-xs text-muted-foreground">{lawyer.email}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Input 
                        type="email" 
                        placeholder="Or type custom email..." 
                        {...field}
                        className="mt-2"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
          
          <div className="glass p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Litigants</h4>
            </div>
            <div className="space-y-4">
              <FormField
                control={control}
                name="litigant1Email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Litigant 1 Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="litigant1@example.com" 
                        {...field}
                        className="input-focus-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="litigant2Email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Litigant 2 Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="litigant2@example.com" 
                        {...field}
                        className="input-focus-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsSection;
