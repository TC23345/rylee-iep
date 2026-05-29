"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import {
  clientIndexInputSchema,
  clientStatuses,
  deriveClientId,
  deriveDisplayName,
  type ClientIndexInput,
} from "@/lib/client-schema";
import { createClient } from "@/app/actions/clients";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULTS: ClientIndexInput = {
  firstName: "",
  lastInitial: "",
  districtAbbr: "",
  status: "prospective",
};

const STATUS_LABELS: Record<(typeof clientStatuses)[number], string> = {
  prospective: "Prospective",
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

function TextField({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<ClientIndexInput>;
  name: FieldPath<ClientIndexInput>;
  label: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} value={(field.value as string) ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function NewClientModal() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<ClientIndexInput>({
    resolver: zodResolver(clientIndexInputSchema),
    defaultValues: DEFAULTS,
    mode: "onSubmit",
  });

  const control = form.control as Control<ClientIndexInput>;
  const [firstName, lastInitial, districtAbbr] = useWatch({
    control,
    name: ["firstName", "lastInitial", "districtAbbr"],
  });
  const idValid =
    !!firstName &&
    /^[A-Za-z]$/.test(lastInitial || "") &&
    /^[A-Za-z0-9]+$/.test(districtAbbr || "");
  const previewId = idValid ? deriveClientId(firstName, lastInitial, districtAbbr) : "-";
  const previewName = firstName && lastInitial ? deriveDisplayName(firstName, lastInitial) : "-";

  function onSubmit(values: ClientIndexInput) {
    startTransition(async () => {
      const res = await createClient(values);
      if (res.ok) {
        toast.success(`Client ${res.clientId} added.`);
        form.reset(DEFAULTS);
        setOpen(false);
      } else {
        toast.error(res.error);
        if (res.field) {
          form.setError(res.field as FieldPath<ClientIndexInput>, { message: res.error });
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary gap-1.5">
          <Plus className="size-4" /> New Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">New client index entry</DialogTitle>
          <DialogDescription>
            Stores minimal metadata only. Full intake storage is intentionally deferred.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="rounded-md border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
              Do not enter parent contact details, school names, disability details, dates of
              birth, or documents here. V1 stores only the index fields below.
            </div>

            <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-gold-dim">
                Derived on save
              </div>
              <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm">
                <span>
                  client_id: <span className="text-terracotta">{previewId}</span>
                </span>
                <span>
                  display: <span className="text-terracotta">{previewName}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <TextField control={control} name="firstName" label="First name" placeholder="Marcus" />
              <TextField control={control} name="lastInitial" label="Last initial" placeholder="T" />
              <TextField control={control} name="districtAbbr" label="District abbr" placeholder="D214" />
            </div>

            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value as string}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Saving..." : "Add client"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
