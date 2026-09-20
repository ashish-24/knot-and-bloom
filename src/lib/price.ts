import { prisma } from './db';

export interface CartCalculationItem {
  productId: string;
  quantity: number;
  customizationDetails?: Record<string, string>;
}

export interface CalculationResult {
  items: Array<{
    productId: string;
    name: string;
    thumbnail: string;
    quantity: number;
    unitPrice: number;
    customizationFee: number;
    totalItemPrice: number;
    customizationDetails?: Record<string, string>;
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
}

export async function calculateCartTotals(
  rawItems: CartCalculationItem[],
  couponCode?: string
): Promise<CalculationResult> {
  const storeSettings = await prisma.storeSettings.findFirst() || {
    deliveryFee: 49,
    freeDeliveryOver: 999,
  };

  const validatedItems = [];
  let subtotal = 0;

  for (const rawItem of rawItems) {
    const product = await prisma.product.findUnique({
      where: { id: rawItem.productId },
      include: { customizationOpts: true },
    });

    if (!product || !product.published || product.deletedAt !== null) {
      continue;
    }

    // Determine customization fees if any
    let customizationFee = 0;
    if (rawItem.customizationDetails && product.customizationOpts.length > 0) {
      for (const opt of product.customizationOpts) {
        if (rawItem.customizationDetails[opt.label] && opt.additionalFee > 0) {
          customizationFee += opt.additionalFee;
        }
      }
    }

    const unitPrice = product.price;
    const itemTotal = (unitPrice + customizationFee) * rawItem.quantity;
    subtotal += itemTotal;

    validatedItems.push({
      productId: product.id,
      name: product.name,
      thumbnail: product.thumbnail,
      quantity: rawItem.quantity,
      unitPrice,
      customizationFee,
      totalItemPrice: itemTotal,
      customizationDetails: rawItem.customizationDetails,
    });
  }

  // Calculate delivery fee
  let deliveryFee = storeSettings.deliveryFee;
  if (subtotal >= storeSettings.freeDeliveryOver || subtotal === 0) {
    deliveryFee = 0;
  }

  // Optional coupon discount logic
  let discount = 0;
  if (couponCode && couponCode.toUpperCase() === 'WELCOME10') {
    discount = Math.round(subtotal * 0.1); // 10% off
  }

  const finalTotal = Math.max(0, subtotal + deliveryFee - discount);

  return {
    items: validatedItems,
    subtotal,
    deliveryFee,
    discount,
    finalTotal,
  };
}
