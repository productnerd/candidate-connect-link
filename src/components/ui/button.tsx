import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[12px] font-bold uppercase tracking-wider ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 
          "relative bg-gradient-to-b from-primary via-primary to-primary/90 text-background/90 " +
          "border border-primary-foreground/10 " +
          "shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.35),0_4px_12px_-2px_hsl(var(--primary)/0.25),inset_0_2px_4px_0_hsl(38_25%_96%/0.25),inset_0_-2px_4px_0_hsl(25_30%_10%/0.1)] " +
          "hover:shadow-[0_12px_32px_-4px_hsl(var(--primary)/0.45),0_6px_16px_-2px_hsl(var(--primary)/0.3),inset_0_2px_4px_0_hsl(38_25%_96%/0.3),inset_0_-2px_4px_0_hsl(25_30%_10%/0.1)] " +
          "hover:-translate-y-1 active:translate-y-0 active:shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.3),inset_0_2px_4px_0_hsl(25_30%_10%/0.1)]",
        destructive: 
          "relative bg-gradient-to-b from-destructive via-destructive to-destructive/90 text-destructive-foreground " +
          "border border-destructive-foreground/10 " +
          "shadow-[0_8px_24px_-4px_hsl(var(--destructive)/0.35),inset_0_2px_4px_0_hsl(38_25%_96%/0.2),inset_0_-2px_4px_0_hsl(25_30%_10%/0.1)] " +
          "hover:-translate-y-0.5",
        outline: 
          "relative border border-border/80 bg-gradient-to-b from-background via-background to-muted/30 backdrop-blur-md " +
          "shadow-[0_4px_16px_-4px_hsl(25_30%_10%/0.08),inset_0_2px_4px_0_hsl(38_25%_96%/0.6),inset_0_-1px_2px_0_hsl(25_30%_10%/0.02)] " +
          "hover:border-primary/40 hover:shadow-[0_8px_24px_-4px_hsl(25_30%_10%/0.12),inset_0_2px_4px_0_hsl(38_25%_96%/0.8)] hover:-translate-y-0.5",
        secondary: 
          "relative bg-secondary backdrop-blur-xl text-secondary-foreground " +
          "border border-border/60 " +
          "shadow-[0_4px_16px_-4px_hsl(25_30%_10%/0.1),inset_0_1px_2px_0_hsl(38_25%_96%/0.4)] " +
          "hover:bg-secondary/80 hover:border-border hover:-translate-y-0.5",
        tertiary:
          "relative bg-background/20 backdrop-blur-md " +
          "border border-foreground/20 " +
          "shadow-[0_0_20px_0_hsl(var(--primary)/0.15),inset_0_1px_2px_0_hsl(38_25%_96%/0.2)] " +
          "hover:shadow-[0_0_30px_0_hsl(var(--primary)/0.25),inset_0_1px_2px_0_hsl(38_25%_96%/0.3)] hover:border-primary/40 hover:-translate-y-0.5",
        ghost: "hover:bg-secondary/80 hover:text-foreground border border-transparent hover:border-border/50",
        link: "text-primary underline-offset-4 hover:underline normal-case",
        hero: 
          "relative bg-gradient-to-b from-primary via-primary to-primary/85 text-background/90 font-semibold " +
          "border border-primary-foreground/15 " +
          "shadow-[0_12px_32px_-4px_hsl(var(--primary)/0.4),0_6px_16px_-2px_hsl(var(--primary)/0.3),inset_0_3px_6px_0_hsl(38_25%_96%/0.3),inset_0_-3px_6px_0_hsl(25_30%_10%/0.15)] " +
          "hover:shadow-[0_20px_48px_-8px_hsl(var(--primary)/0.5),0_10px_24px_-4px_hsl(var(--primary)/0.35),inset_0_3px_6px_0_hsl(38_25%_96%/0.35),inset_0_-3px_6px_0_hsl(25_30%_10%/0.15)] " +
          "hover:-translate-y-1.5 active:translate-y-0",
        accent: 
          "relative bg-gradient-to-b from-accent via-accent to-accent/85 text-background/90 font-semibold " +
          "border border-accent-foreground/10 " +
          "shadow-[0_8px_24px_-4px_hsl(var(--accent)/0.4),inset_0_2px_4px_0_hsl(38_25%_96%/0.3),inset_0_-2px_4px_0_hsl(25_30%_10%/0.1)] " +
          "hover:shadow-[0_12px_32px_-4px_hsl(var(--accent)/0.5),inset_0_2px_4px_0_hsl(38_25%_96%/0.35)] hover:-translate-y-1",
        glass: 
          "relative bg-gradient-to-b from-card/90 via-card/70 to-card/50 dark:from-card/20 dark:via-card/10 dark:to-card/05 backdrop-blur-xl " +
          "border border-foreground/10 dark:border-foreground/5 text-foreground " +
          "shadow-[0_8px_32px_-4px_hsl(25_30%_10%/0.1),0_4px_16px_-2px_hsl(25_30%_10%/0.08),inset_0_2px_4px_0_hsl(38_25%_96%/0.8),inset_0_-2px_4px_0_hsl(25_30%_10%/0.02)] " +
          "hover:shadow-[0_16px_48px_-8px_hsl(25_30%_10%/0.15),0_8px_24px_-4px_hsl(25_30%_10%/0.1),inset_0_2px_4px_0_hsl(38_25%_96%/0.9)] " +
          "hover:-translate-y-1 active:translate-y-0",
      },
      size: {
        default: "h-8 px-3.5 py-1",
        sm: "h-7 rounded-lg px-2.5 text-[9px]",
        lg: "h-9 rounded-xl px-5 text-[10px]",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
