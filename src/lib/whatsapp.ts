export function formatWhatsAppPhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export interface WhatsAppProductPayload {
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  customizationDetails?: Record<string, string>;
}

export interface WhatsAppCartPayload {
  items: WhatsAppProductPayload[];
  totalPrice: number;
}

export function generateProductWhatsAppUrl(
  phone: string,
  payload: WhatsAppProductPayload
): string {
  const cleanPhone = formatWhatsAppPhone(phone);
  let message = `Hello Romi & Knot! 🌿\nI would like to order:\n\n*Product:* ${payload.productName}\n*SKU:* ${payload.sku}\n*Quantity:* ${payload.quantity}\n*Price:* ₹${payload.price}\n`;

  if (payload.customizationDetails && Object.keys(payload.customizationDetails).length > 0) {
    message += `*Customization:* \n`;
    for (const [key, val] of Object.entries(payload.customizationDetails)) {
      message += ` - ${key}: ${val}\n`;
    }
  }

  message += `\nPlease guide me on completing my order. Thank you!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateCartWhatsAppUrl(
  phone: string,
  payload: WhatsAppCartPayload
): string {
  const cleanPhone = formatWhatsAppPhone(phone);
  let message = `Hello Romi & Knot! 🌿\nI would like to place an order for my cart:\n\n`;

  payload.items.forEach((item, idx) => {
    message += `${idx + 1}. *${item.productName}* (Qty: ${item.quantity}) - ₹${item.price * item.quantity}\n`;
    if (item.customizationDetails && Object.keys(item.customizationDetails).length > 0) {
      for (const [k, v] of Object.entries(item.customizationDetails)) {
        message += `   • ${k}: ${v}\n`;
      }
    }
  });

  message += `\n*Total Estimated Amount:* ₹${payload.totalPrice}\n\nPlease confirm availability and payment details. Thank you!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
