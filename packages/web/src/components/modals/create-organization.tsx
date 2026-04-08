import * as React from 'react';
import {
  User,
  Users,
  CheckCircle,
  Buildings,
  Link as LinkIcon,
  Stack,
} from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrganizationModal({
  open,
  onOpenChange,
}: CreateOrganizationModalProps) {
  const [plan, setPlan] = React.useState<'free' | 'paid'>('free');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background text-foreground flex min-h-[80vh] flex-col overflow-hidden border-none p-0 shadow-2xl sm:h-auto sm:min-h-0 sm:max-w-4xl">
        <div className="flex-grow overflow-y-auto px-6 pb-8 pt-12 flex justify-center">
          <div className="w-full max-w-3xl">
            {/* Progress Indicator */}
            <div className="mb-10 text-center">
              <p className="text-primary mb-2 text-xs font-semibold uppercase tracking-wide">
                Step 1 of 2
              </p>
              <DialogTitle className="font-heading mb-2 text-3xl font-extrabold tracking-tight">
                Organization Details
              </DialogTitle>
              <p className="text-muted-foreground mx-auto max-w-md">
                Establish your digital infrastructure by selecting a plan and
                defining your organization's core identity.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="bg-primary h-1.5 w-16 rounded-full"></div>
                <div className="bg-muted h-1.5 w-16 rounded-full"></div>
              </div>
            </div>

            {/* Form Container */}
            <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
              {/* Section 1: Plan Selection */}
              <section>
                <div className="mb-6 flex items-center gap-2">
                  <Stack size={24} weight="fill" className="text-primary" />
                  <h2 className="font-heading text-xl font-bold">
                    Select Organization Type
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Private Organization Card */}
                  <label className="group relative cursor-pointer">
                    <input
                      type="radio"
                      name="plan"
                      value="free"
                      checked={plan === 'free'}
                      onChange={() => setPlan('free')}
                      className="peer sr-only"
                    />
                    <div className="bg-card hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-background h-full rounded-xl border border-transparent p-6 transition-all duration-200 peer-checked:shadow-lg">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="bg-muted text-primary rounded-lg p-3">
                          <User size={24} weight="fill" />
                        </div>
                        <span className="text-primary text-lg font-bold">
                          Free
                        </span>
                      </div>
                      <h3 className="font-heading mb-1 text-lg font-bold">
                        Private Organization
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm font-medium">
                        Just for me
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Best for individual projects and personal data
                        management.
                      </p>
                      <div className="absolute right-4 top-4 opacity-0 transition-opacity peer-checked:opacity-100">
                        <CheckCircle
                          size={24}
                          weight="fill"
                          className="text-primary"
                        />
                      </div>
                    </div>
                  </label>

                  {/* Enterprise Organization Card */}
                  <label className="group relative cursor-pointer">
                    <input
                      type="radio"
                      name="plan"
                      value="paid"
                      checked={plan === 'paid'}
                      onChange={() => setPlan('paid')}
                      className="peer sr-only"
                    />
                    <div className="bg-card hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:border-l-primary h-full rounded-xl border border-transparent border-l-4 p-6 transition-all duration-200 peer-checked:shadow-lg">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3">
                        <Users size={24} weight="fill" />
                      </div>
                      <span className="text-primary text-lg font-bold">
                        Paid
                      </span>
                    </div>
                    <h3 className="font-heading mb-1 text-lg font-bold">
                      Enterprise Organization
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm font-medium">
                      Invite your team
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Advanced permissions, collaboration, and custom billing
                      for scale.
                    </p>
                    <div className="absolute right-4 top-4 opacity-0 transition-opacity peer-checked:opacity-100">
                      <CheckCircle
                        size={24}
                        weight="fill"
                        className="text-primary"
                      />
                    </div>
                    <div className="bg-primary/20 text-primary mt-4 inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Professional Choice
                    </div>
                  </label>
                </div>
              </section>

              {/* Section 2: Basic Info */}
              <section className="bg-muted/30 border-border rounded-xl border p-8 space-y-8">
                <div className="flex items-center gap-2">
                  <Buildings size={24} weight="fill" className="text-primary" />
                  <h2 className="font-heading text-xl font-bold">
                    Core Identity
                  </h2>
                </div>
                <div className="flex max-w-2xl flex-col gap-6">
                  {/* Display Name Input */}
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="display-name"
                      className="text-muted-foreground text-sm font-semibold"
                    >
                      Display Name
                    </Label>
                    <Input
                      id="display-name"
                      placeholder="My Cool Project"
                      className="bg-background border-border focus-visible:ring-primary h-12 rounded-lg px-4 py-3 text-base shadow-sm focus-visible:ring-2"
                    />
                  </div>
                  {/* Slug Input */}
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="slug"
                      className="text-muted-foreground text-sm font-semibold"
                    >
                      Organization Slug
                    </Label>
                    <Input
                      id="slug"
                      placeholder="my-cool-project"
                      className="bg-background border-border focus-visible:ring-primary h-12 rounded-lg px-4 py-3 text-base shadow-sm focus-visible:ring-2"
                    />
                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                      <LinkIcon size={14} />
                      app.yourdomain.com/
                      <span className="text-primary font-bold">
                        my-cool-project
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="border-border flex items-center justify-end gap-4 border-t pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="hover:bg-muted rounded-lg px-8 py-5 text-sm font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-lg px-10 py-5 text-sm font-bold shadow-md transition-all hover:shadow-lg"
                >
                  Create Organization
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Decorative/Legal */}
        <div className="border-border bg-muted/10 border-t px-6 py-6 text-center">
          <p className="text-muted-foreground text-xs opacity-80">
            Powered by Better Auth • Secured with The Architectural Sentinel
            Protocol
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
