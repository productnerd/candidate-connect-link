import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-medium uppercase tracking-wider ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 
          "relative bg-gradient-to-b from-primary via-primary to-primary/90 text-primary-foreground " +
          "shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.35),0_4px_12px_-2px_hsl(var(--primary)/0.25),inset_0_2px_4px_0_hsl(38_25%_96%/0.25),inset_0_-2px_4px_0_hsl(25_30%_10%/0.1)] " +
          "hover:shadow-[0_12px_32px_-4px_hsl(var(--primary)/0.45),0_6px_16px_-2px_hsl(var(--primary)/0.3),inset_0_2px_4px_0_hsl(38_25%_96%/0.3),inset_0_-2px_4px_0_hsl(25_30%_10%/0.1)] " +
          "hover:-translate-y-1 active:translate-y-0 active:shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.3),inset_0_2px_4px_0_hsl(25_30%_10%/0.1)]",
        destructive: 
          "relative bg-gradient-to-b from-destructive via-destructive to-destructive/90 text-destructive-foreground " +
          "shadow-[0_8px_24px_-4px_hsl(var(--destructive)/0.35),inset_0_2px_4px_0_hsl(38_25%_96%/0.2),inset_0_-2px_4px_0_hsl(25_30%_10%/0.1)] " +
          "hover:-translate-y-0.5",
        outline: 
          "relative border-2 border-border/60 bg-gradient-to-b from-background via-background to-muted/30 backdrop-blur-md " +
          "shadow-[0_4px_16px_-4px_hsl(25_30%_10%/0.08),inset_0_2px_4px_0_hsl(38_25%_96%/0.6),inset_0_-1px_2px_0_hsl(25_30%_10%/0.02)] " +
          "hover:border-primary/40 hover:shadow-[0_8px_24px_-4px_hsl(25_30%_10%/0.12),inset_0_2px_4px_0_hsl(38_25%_96%/0.8)] hover:-translate-y-0.5",
        secondary: 
          "relative bg-gradient-to-b from-secondary via-secondary to-secondary/80 text-secondary-foreground " +
          "shadow-[0_4px_16px_-4px_hsl(25_30%_10%/0.1),inset_0_2px_4px_0_hsl(38_25%_96%/0.5),inset_0_-2px_4px_0_hsl(25_30%_10%/0.03)] " +
          "hover:-translate-y-0.5",
        ghost: "hover:bg-secondary/80 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline normal-case",
        hero: 
          "relative bg-gradient-to-b from-primary via-primary to-primary/85 text-primary-foreground font-semibold " +
          "shadow-[0_12px_32px_-4px_hsl(var(--primary)/0.4),0_6px_16px_-2px_hsl(var(--primary)/0.3),inset_0_3px_6px_0_hsl(38_25%_96%/0.3),inset_0_-3px_6px_0_hsl(25_30%_10%/0.15)] " +
          "hover:shadow-[0_20px_48px_-8px_hsl(var(--primary)/0.5),0_10px_24px_-4px_hsl(var(--primary)/0.35),inset_0_3px_6px_0_hsl(38_25%_96%/0.35),inset_0_-3px_6px_0_hsl(25_30%_10%/0.15)] " +
          "hover:-translate-y-1.5 active:translate-y-0",
        accent: 
          "relative bg-gradient-to-b from-accent via-accent to-accent/85 text-accent-foreground font-semibold " +
          "shadow-[0_8px_24px_-4px_hsl(var(--accent)/0.4),inset_0_2px_4px_0_hsl(38_25%_96%/0.3),inset_0_-2px_4px_0_hsl(25_30%_10%/0.1)] " +
          "hover:shadow-[0_12px_32px_-4px_hsl(var(--accent)/0.5),inset_0_2px_4px_0_hsl(38_25%_96%/0.35)] hover:-translate-y-1",
        glass: 
          "relative bg-gradient-to-b from-card/90 via-card/70 to-card/50 dark:from-card/20 dark:via-card/10 dark:to-card/05 backdrop-blur-xl " +
          "border border-border/60 dark:border-border/30 text-foreground " +
          "shadow-[0_8px_32px_-4px_hsl(25_30%_10%/0.1),0_4px_16px_-2px_hsl(25_30%_10%/0.08),inset_0_2px_4px_0_hsl(38_25%_96%/0.8),inset_0_-2px_4px_0_hsl(25_30%_10%/0.02)] " +
          "hover:shadow-[0_16px_48px_-8px_hsl(25_30%_10%/0.15),0_8px_24px_-4px_hsl(25_30%_10%/0.1),inset_0_2px_4px_0_hsl(38_25%_96%/0.9)] " +
          "hover:-translate-y-1 active:translate-y-0",
      },
      size: {
        default: "h-9 px-4 py-1.5",
        sm: "h-8 rounded-lg px-3 text-[10px]",
        lg: "h-10 rounded-xl px-6 text-xs",
        xl: "h-12 rounded-2xl px-8 text-sm",
        icon: "h-9 w-9",
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
