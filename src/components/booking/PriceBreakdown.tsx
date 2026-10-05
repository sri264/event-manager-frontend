import { formatINRPrecise, unitLabel } from '@/lib/format';
import type { PriceUnit } from '@/types/venue';

interface PriceBreakdownProps {
  unitPrice: number;
  units: number;
  priceUnit: PriceUnit;
  baseAmount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  amountPaid?: number;
  balanceDue?: number;
}

export function PriceBreakdown(props: PriceBreakdownProps) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">
          {formatINRPrecise(props.unitPrice)} × {unitLabel(props.priceUnit, props.units)}
        </dt>
        <dd className="font-medium">{formatINRPrecise(props.baseAmount)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">GST ({props.gstPercent}%)</dt>
        <dd className="font-medium">{formatINRPrecise(props.gstAmount)}</dd>
      </div>
      <div className="flex justify-between border-t pt-2 text-base">
        <dt className="font-bold text-navy">Total</dt>
        <dd className="font-extrabold text-navy">{formatINRPrecise(props.totalAmount)}</dd>
      </div>
      {props.amountPaid !== undefined && (
        <>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Paid</dt>
            <dd className="font-medium text-emerald-600">{formatINRPrecise(props.amountPaid)}</dd>
          </div>
          {!!props.balanceDue && (
            <div className="flex justify-between">
              <dt className="font-semibold text-amber-700">Balance due</dt>
              <dd className="font-bold text-amber-700">{formatINRPrecise(props.balanceDue)}</dd>
            </div>
          )}
        </>
      )}
    </dl>
  );
}
