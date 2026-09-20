import { NextResponse } from 'next/server';
import { getAdminFromSession, logAdminAction } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const admin = await getAdminFromSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      name,
      shortDescription,
      description,
      price,
      originalPrice,
      stock,
      categoryId,
      thumbnail,
      material,
      dimensions,
      weight,
      careInstructions,
      color,
      featured,
      bestseller,
      trending,
      giftPick,
      customizable,
      customizations,
      variants,
      galleryImages,
    } = body;

    if (!name || !price || !thumbnail) {
      return NextResponse.json(
        { error: 'Name, price, and product image are mandatory.' },
        { status: 400 }
      );
    }

    // Resolve valid Category ID to avoid Foreign Key constraint violations
    let targetCategoryId = categoryId;
    if (targetCategoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: targetCategoryId } });
      if (!categoryExists) targetCategoryId = null;
    }

    if (!targetCategoryId) {
      const firstCat = await prisma.category.findFirst();
      if (firstCat) {
        targetCategoryId = firstCat.id;
      } else {
        const newCat = await prisma.category.create({
          data: {
            name: 'Handmade Gifts & Decor',
            slug: 'handmade-gifts-decor',
            description: 'Handcrafted artisan gifts and boutique products',
          },
        });
        targetCategoryId = newCat.id;
      }
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const sku = `KB-${slug.slice(0, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const allImages = Array.from(new Set([thumbnail, ...(galleryImages || [])].filter(Boolean)));

    if (id) {
      // Update existing product
      const updated = await prisma.product.update({
        where: { id },
        data: {
          name,
          shortDescription: shortDescription || name,
          description: description || name,
          price: parseFloat(price),
          originalPrice: parseFloat(originalPrice || price),
          stock: parseInt(stock || '10'),
          categoryId: targetCategoryId,
          thumbnail,
          material,
          dimensions,
          weight,
          careInstructions,
          color,
          featured: Boolean(featured ?? true),
          bestseller: Boolean(bestseller),
          trending: Boolean(trending),
          giftPick: Boolean(giftPick),
          customizable: Boolean(customizable),
        },
      });

      // Update gallery images
      if (allImages.length > 0) {
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.productImage.createMany({
          data: allImages.map((url: string, idx: number) => ({
            productId: id,
            url,
            sortOrder: idx,
          })),
        });
      }

      // Delete old variants and create updated ones
      if (variants && Array.isArray(variants)) {
        await prisma.productVariant.deleteMany({ where: { productId: id } });
        if (variants.length > 0) {
          await prisma.productVariant.createMany({
            data: variants.map((v: any) => ({
              productId: id,
              name: v.name,
              colorHex: v.colorHex || null,
              imageUrl: v.imageUrl || null,
              priceAdjust: parseFloat(v.priceAdjust || '0'),
            })),
          });
        }
      }

      // Delete old customization options and recreate if customizable
      await prisma.customizationOption.deleteMany({ where: { productId: id } });
      if (Boolean(customizable) && customizations && Array.isArray(customizations) && customizations.length > 0) {
        await prisma.customizationOption.createMany({
          data: customizations.map((c: any) => ({
            productId: id,
            label: c.label || 'Custom Text',
            type: c.type || 'text',
            required: Boolean(c.required),
            additionalFee: parseFloat(c.additionalFee || '0'),
          })),
        });
      }

      await logAdminAction('PRODUCT_UPDATED', `Updated product ${updated.name}`, admin.name);
      return NextResponse.json({ success: true, product: updated });
    } else {
      // Create new product
      const created = await prisma.product.create({
        data: {
          name,
          slug,
          sku,
          shortDescription: shortDescription || name,
          description: description || name,
          price: parseFloat(price),
          originalPrice: parseFloat(originalPrice || price),
          stock: parseInt(stock || '10'),
          categoryId: targetCategoryId,
          thumbnail,
          material,
          dimensions,
          weight,
          careInstructions,
          color,
          featured: Boolean(featured ?? true),
          bestseller: Boolean(bestseller),
          trending: Boolean(trending),
          giftPick: Boolean(giftPick),
          customizable: Boolean(customizable),
          images: {
            create: allImages.map((url: string, idx: number) => ({
              url,
              sortOrder: idx,
            })),
          },
          variants:
            variants && Array.isArray(variants) && variants.length > 0
              ? {
                  create: variants.map((v: any) => ({
                    name: v.name,
                    colorHex: v.colorHex || null,
                    imageUrl: v.imageUrl || null,
                    priceAdjust: parseFloat(v.priceAdjust || '0'),
                  })),
                }
              : undefined,
          customizationOpts:
            customizations && Array.isArray(customizations) && customizations.length > 0
              ? {
                  create: customizations.map((c: any) => ({
                    label: c.label || 'Custom Text',
                    type: c.type || 'text',
                    required: Boolean(c.required),
                    additionalFee: parseFloat(c.additionalFee || '0'),
                  })),
                }
              : undefined,
        },
      });

      await logAdminAction('PRODUCT_CREATED', `Created new product ${created.name}`, admin.name);
      return NextResponse.json({ success: true, product: created });
    }
  } catch (err: any) {
    console.error('Error saving product:', err);
    return NextResponse.json(
      { error: err.message || 'Error saving product to database.' },
      { status: 500 }
    );
  }
}
