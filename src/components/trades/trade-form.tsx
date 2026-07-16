'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { tradeInputSchema, TradeInput } from '@/validators/trade';
import { EMOTIONS, SETUPS, SYMBOLS, TradeDTO } from '@/types/trade';
import { Label, Input, Select, Textarea, FieldError } from '@/components/ui/form-fields';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TradeFormProps {
  defaultValues?: TradeDTO;
  onSubmit: (input: TradeInput) => Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
}

function toFormDefaults(trade?: TradeDTO): Partial<TradeInput> {
  if (!trade) {
    return { date: new Date().toISOString().slice(0, 10) };
  }
  return {
    date: trade.date.slice(0, 10),
    symbol: trade.symbol as TradeInput['symbol'],
    customSymbol: trade.customSymbol,
    result: trade.result,
    setup: trade.setup as TradeInput['setup'],
    customSetup: trade.customSetup,
    emotion: trade.emotion as TradeInput['emotion'],
    notes: trade.notes,
  };
}

export function TradeForm({ defaultValues, onSubmit, submitting, submitLabel = 'Save Trade' }: TradeFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TradeInput>({
    resolver: zodResolver(tradeInputSchema),
    defaultValues: toFormDefaults(defaultValues),
  });

  const symbol = watch('symbol');
  const setup = watch('setup');

  return (
    <form
      onSubmit={handleSubmit(async (data) => onSubmit(data))}
      className="space-y-5"
    >
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register('date')} />
            <FieldError message={errors.date?.message} />
          </div>

          <div>
            <Label htmlFor="result">Result ($)</Label>
            <Input
              id="result"
              type="number"
              step="0.01"
              placeholder="e.g. 250 or -120"
              {...register('result')}
            />
            <FieldError message={errors.result?.message} />
          </div>

          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <Select id="symbol" {...register('symbol')} defaultValue="">
              <option value="" disabled>
                Select a symbol
              </option>
              {SYMBOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <FieldError message={errors.symbol?.message} />
          </div>

          {symbol === 'Other' && (
            <div>
              <Label htmlFor="customSymbol">Custom symbol</Label>
              <Input id="customSymbol" placeholder="e.g. NAS100" {...register('customSymbol')} />
              <FieldError message={errors.customSymbol?.message} />
            </div>
          )}

          <div>
            <Label htmlFor="setup">Setup</Label>
            <Select id="setup" {...register('setup')} defaultValue="">
              <option value="" disabled>
                Select a setup
              </option>
              {SETUPS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <FieldError message={errors.setup?.message} />
          </div>

          {setup === 'Other' && (
            <div>
              <Label htmlFor="customSetup">Custom setup</Label>
              <Input id="customSetup" placeholder="e.g. News Fade" {...register('customSetup')} />
              <FieldError message={errors.customSetup?.message} />
            </div>
          )}

          <div>
            <Label htmlFor="emotion">Emotion / how I felt</Label>
            <Select id="emotion" {...register('emotion')} defaultValue="">
              <option value="" disabled>
                Select an emotion
              </option>
              {EMOTIONS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
            <FieldError message={errors.emotion?.message} />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            rows={5}
            placeholder="What happened, why you entered, mistakes, lessons learned..."
            {...register('notes')}
          />
          <FieldError message={errors.notes?.message} />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
