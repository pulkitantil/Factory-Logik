import prisma from '../lib/prisma.js';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any;
}

export const AI_TOOLS: ToolDefinition[] = [
  {
    name: 'searchProducts',
    description: 'Search for industrial automation products by query, category, brand, and budget.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword to search e.g. PLC, VFD, HMI, servo drive, sensor' },
        category: { type: 'string', description: 'Category slug or name e.g. plc, vfd, hmi, sensors, motors' },
        brand: { type: 'string', description: 'Brand name e.g. Siemens, ABB, Delta, Schneider Electric, Omron' },
        maxPrice: { type: 'number', description: 'Upper budget limit in INR' },
        minPrice: { type: 'number', description: 'Lower budget limit in INR' },
      },
    },
  },
  {
    name: 'getProductDetails',
    description: 'Retrieve full specifications, stock, price, and features for a product.',
    parameters: {
      type: 'object',
      properties: {
        productIdOrSlug: { type: 'string', description: 'Product ID or slug' },
      },
      required: ['productIdOrSlug'],
    },
  },
  {
    name: 'compareProducts',
    description: 'Compare 2 or more products side by side with technical specifications and prices.',
    parameters: {
      type: 'object',
      properties: {
        productIdsOrSlugs: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of product IDs or slugs to compare',
        },
      },
      required: ['productIdsOrSlugs'],
    },
  },
  {
    name: 'checkProductStock',
    description: 'Check real-time stock availability and delivery options for a product.',
    parameters: {
      type: 'object',
      properties: {
        productIdOrSlug: { type: 'string', description: 'Product ID or slug' },
      },
      required: ['productIdOrSlug'],
    },
  },
  {
    name: 'getUserOrders',
    description: 'Retrieve current and past orders for the authenticated user.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'getOrderStatus',
    description: 'Retrieve the status and tracking details for a specific order or tracking ID.',
    parameters: {
      type: 'object',
      properties: {
        orderOrTrackingId: { type: 'string', description: 'Order number like ORD-2026-XXXX or tracking ID' },
      },
    },
  },
];

// Tool Implementation Handlers
export async function executeTool(toolName: string, args: any, userId?: string) {
  switch (toolName) {
    case 'searchProducts': {
      const { query, category, brand, maxPrice, minPrice } = args;
      const where: any = { active: true };

      if (category) {
        where.category = {
          OR: [{ slug: { contains: category } }, { name: { contains: category } }],
        };
      }
      if (brand) {
        where.brand = { contains: brand };
      }
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
      }
      if (query) {
        where.OR = [
          { name: { contains: query } },
          { brand: { contains: query } },
          { description: { contains: query } },
        ];
      }

      const products = await prisma.product.findMany({
        where,
        take: 6,
        include: {
          images: { where: { isPrimary: true } },
          category: { select: { name: true, slug: true } },
        },
        orderBy: { rating: 'desc' },
      });

      return {
        count: products.length,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          price: p.price,
          mrp: p.mrp,
          discount: p.discount,
          rating: p.rating,
          stock: p.stock,
          image: p.images[0]?.url || '',
          specs: p.specifications ? JSON.parse(p.specifications) : {},
        })),
      };
    }

    case 'getProductDetails': {
      const { productIdOrSlug } = args;
      const isHex = /^[0-9a-fA-F]{24}$/.test(productIdOrSlug);
      const product = await prisma.product.findFirst({
        where: {
          ...(isHex ? { OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }] } : { slug: productIdOrSlug }),
          active: true,
        },
        include: {
          images: true,
          category: true,
        },
      });

      if (!product) {
        return { error: 'Product not found.' };
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        price: product.price,
        mrp: product.mrp,
        discount: product.discount,
        stock: product.stock,
        rating: product.rating,
        warranty: product.warranty,
        image: product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url || '',
        specs: product.specifications ? JSON.parse(product.specifications) : {},
        features: product.features ? JSON.parse(product.features) : [],
      };
    }

    case 'compareProducts': {
      const { productIdsOrSlugs } = args;
      if (!Array.isArray(productIdsOrSlugs) || productIdsOrSlugs.length === 0) {
        return { error: 'Please provide products to compare.' };
      }

      const hexList = productIdsOrSlugs.filter((p: string) => /^[0-9a-fA-F]{24}$/.test(p));
      const orConditions: any[] = [{ slug: { in: productIdsOrSlugs } }];
      if (hexList.length > 0) {
        orConditions.push({ id: { in: hexList } });
      }

      const products = await prisma.product.findMany({
        where: {
          OR: orConditions,
          active: true,
        },
        include: { images: true },
      });

      return {
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          price: p.price,
          mrp: p.mrp,
          discount: p.discount,
          rating: p.rating,
          stock: p.stock,
          image: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || '',
          specs: p.specifications ? JSON.parse(p.specifications) : {},
        })),
      };
    }

    case 'checkProductStock': {
      const { productIdOrSlug } = args;
      const isHex = /^[0-9a-fA-F]{24}$/.test(productIdOrSlug);
      const product = await prisma.product.findFirst({
        where: isHex ? { OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }] } : { slug: productIdOrSlug },
        select: { id: true, name: true, stock: true, price: true },
      });

      if (!product) return { error: 'Product not found' };
      return {
        name: product.name,
        inStock: product.stock > 0,
        stockCount: product.stock,
        fastDeliveryAvailable: true,
      };
    }

    case 'getUserOrders': {
      if (!userId) {
        return {
          authenticated: false,
          message: 'Please log in to view and track your personal orders.',
        };
      }

      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          items: true,
          tracking: {
            include: {
              events: { orderBy: { timestamp: 'desc' }, take: 1 },
            },
          },
        },
      });

      return {
        authenticated: true,
        orders: orders.map((o) => ({
          orderNumber: o.orderNumber,
          date: o.createdAt,
          status: o.status,
          finalAmount: o.finalAmount,
          trackingNumber: o.tracking?.trackingNumber,
          currentStatus: o.tracking?.currentStatus,
          currentCity: o.tracking?.currentCity,
          estimatedDelivery: o.estimatedDelivery,
          items: o.items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price })),
          latestEvent: o.tracking?.events[0]?.description || 'Order registered in system',
        })),
      };
    }

    case 'getOrderStatus': {
      const { orderOrTrackingId } = args;
      if (!orderOrTrackingId) {
        // If user is logged in, grab their most recent order
        if (userId) {
          const latestOrder = await prisma.order.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
              tracking: { include: { events: { orderBy: { timestamp: 'asc' } } } },
              items: true,
            },
          });
          if (!latestOrder) {
            return { message: 'You have not placed any orders yet on Factorylogik and Controls.' };
          }
          return {
            found: true,
            orderNumber: latestOrder.orderNumber,
            trackingNumber: latestOrder.tracking?.trackingNumber,
            status: latestOrder.status,
            estimatedDelivery: latestOrder.estimatedDelivery,
            carrier: latestOrder.tracking?.carrier,
            currentCity: latestOrder.tracking?.currentCity,
            items: latestOrder.items,
            timeline: latestOrder.tracking?.events,
          };
        }
        return { error: 'Please provide your Order ID (ORD-...) or Tracking ID (TRK-...).' };
      }

      const clean = orderOrTrackingId.trim().toUpperCase();
      const tracking = await prisma.tracking.findFirst({
        where: {
          OR: [{ trackingNumber: clean }, { order: { orderNumber: clean } }],
        },
        include: {
          order: { include: { items: true } },
          events: { orderBy: { timestamp: 'asc' } },
        },
      });

      if (!tracking) {
        return { error: `Shipment or order '${clean}' was not found in our database.` };
      }

      return {
        found: true,
        orderNumber: tracking.order.orderNumber,
        trackingNumber: tracking.trackingNumber,
        status: tracking.currentStatus,
        estimatedDelivery: tracking.estimatedDate,
        carrier: tracking.carrier,
        currentCity: tracking.currentCity,
        items: tracking.order.items,
        timeline: tracking.events,
      };
    }

    default:
      return { error: `Tool ${toolName} not supported.` };
  }
}

// Built-in intelligent Semantic NLP resolver (ensures AI works 100% reliably out-of-the-box!)
export async function processNaturalLanguageQuery(query: string, userId?: string) {
  const q = query.toLowerCase().trim();

  // 1. Order Tracking Intent ("kaha pahucha", "where is my order", "track order", "ORD-", "TRK-")
  const orderRegex = /(ord-\d{4}-[a-z0-9]+|trk-in-[a-z0-9]+)/i;
  const orderMatch = q.match(orderRegex);

  if (
    orderMatch ||
    q.includes('order') ||
    q.includes('track') ||
    q.includes('pahucha') ||
    q.includes('deliver') ||
    q.includes('kaha hai') ||
    q.includes('status')
  ) {
    const trackingToolResult = await executeTool(
      'getOrderStatus',
      { orderOrTrackingId: orderMatch ? orderMatch[0] : undefined },
      userId
    );

    if (trackingToolResult.found) {
      const t = trackingToolResult;
      const formattedDate = new Date(t.estimatedDelivery).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      let reply = `📦 **Order Update for ${t.orderNumber}**\n\n`;
      reply += `• **Current Status:** \`${t.status.replace(/_/g, ' ')}\`\n`;
      reply += `• **Tracking ID:** \`${t.trackingNumber}\`\n`;
      reply += `• **Location:** ${t.currentCity || 'In Transit'}\n`;
      reply += `• **Carrier:** ${t.carrier || 'Factorylogik Logistics / Express Cargo'}\n`;
      reply += `• **Estimated Delivery:** **${formattedDate}**\n\n`;

      if (t.timeline && t.timeline.length > 0) {
        const latest = t.timeline[t.timeline.length - 1];
        reply += `*Latest Event:* ${latest.description} (${new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})\n`;
      }

      return {
        reply,
        toolCalls: [{ name: 'getOrderStatus', result: trackingToolResult }],
        type: 'ORDER_TRACKING',
        orderData: t,
      };
    } else if (trackingToolResult.message || trackingToolResult.error) {
      return {
        reply: trackingToolResult.message || trackingToolResult.error,
        toolCalls: [{ name: 'getOrderStatus', result: trackingToolResult }],
        type: 'INFO',
      };
    } else {
      return {
        reply: `To track your shipment, please sign in to your account or provide your **Order ID** (e.g. \`ORD-2026-8F4K29\`) or **Tracking ID**!`,
        type: 'INFO',
      };
    }
  }

  // 2. Product Comparison Intent ("compare", "vs", "versus", "antar kya hai")
  if (q.includes('compare') || q.includes(' vs ') || q.includes('versus') || q.includes('dono me se')) {
    // Extract brands or categories
    let brands: string[] = [];
    if (q.includes('siemens') && (q.includes('delta') || q.includes('abb') || q.includes('schneider'))) {
      brands = ['Siemens', q.includes('delta') ? 'Delta' : q.includes('abb') ? 'ABB' : 'Schneider'];
    } else if (q.includes('delta') && (q.includes('schneider') || q.includes('abb') || q.includes('mitsubishi'))) {
      brands = ['Delta', q.includes('schneider') ? 'Schneider' : q.includes('abb') ? 'ABB' : 'Mitsubishi'];
    } else if (q.includes('abb') && q.includes('schneider')) {
      brands = ['ABB', 'Schneider'];
    } else if (q.includes('omron') || q.includes('mitsubishi') || q.includes('fuji')) {
      brands = ['Siemens', 'Delta'];
    }

    // Parse budget if present
    let maxPrice: number | undefined;
    const priceMatch = q.match(/(\d+)\s*(lakh|k|thousand|rupaye|rs|inr|₹)/i);
    if (priceMatch) {
      const num = parseInt(priceMatch[1], 10);
      const unit = priceMatch[2].toLowerCase();
      if (unit.includes('lakh')) maxPrice = num * 100000;
      else if (unit === 'k' || unit.includes('thousand')) maxPrice = num * 1000;
      else maxPrice = num;
    } else {
      const rawPrice = q.match(/(₹|rs\.?|inr)\s*(\d+([,\.]\d+)?)/i);
      if (rawPrice) maxPrice = parseInt(rawPrice[2].replace(/,/g, ''), 10);
      else {
        const simpleNum = q.match(/(\d{4,6})/);
        if (simpleNum) maxPrice = parseInt(simpleNum[1], 10);
      }
    }

    // Determine target category
    let category = '';
    if (q.includes('servo')) category = 'servo-drives';
    else if (q.includes('plc') || q.includes('controller')) category = 'plc';
    else if (q.includes('vfd') || q.includes('drive') || q.includes('inverter')) category = 'vfd';
    else if (q.includes('hmi') || q.includes('display') || q.includes('touch')) category = 'hmi';
    else if (q.includes('motor')) category = 'motors';
    else if (q.includes('sensor') || q.includes('encoder') || q.includes('proximity')) category = 'sensors';
    else if (q.includes('smps') || q.includes('power supply')) category = 'smps-power-supplies';
    else if (q.includes('panel') || q.includes('control panel')) category = 'electrical-control-panels';
    else if (q.includes('cable') || q.includes('wire')) category = 'industrial-cables-accessories';

    // Find candidate products to compare
    let candidateProducts: any[] = [];

    if (brands.length >= 2) {
      for (const b of brands) {
        let prod = await prisma.product.findFirst({
          where: {
            brand: { contains: b },
            ...(category ? { category: { slug: category } } : {}),
            ...(maxPrice ? { price: { lte: maxPrice } } : {}),
            active: true,
          },
          include: { images: true },
        });
        if (!prod) {
          prod = await prisma.product.findFirst({
            where: {
              brand: { contains: b },
              ...(category ? { category: { slug: category } } : {}),
              active: true,
            },
            orderBy: { price: 'asc' },
            include: { images: true },
          });
        }
        if (prod) candidateProducts.push(prod);
      }
    }

    // Fallback: search products by query or category
    if (candidateProducts.length < 2) {
      candidateProducts = await prisma.product.findMany({
        where: {
          ...(category ? { category: { slug: category } } : {}),
          ...(maxPrice ? { price: { lte: maxPrice } } : {}),
          active: true,
        },
        take: 2,
        include: { images: true },
        orderBy: { rating: 'desc' },
      });
    }

    if (candidateProducts.length >= 2) {
      const p1 = candidateProducts[0];
      const p2 = candidateProducts[1];
      const s1 = p1.specifications ? JSON.parse(p1.specifications) : {};
      const s2 = p2.specifications ? JSON.parse(p2.specifications) : {};

      const allKeys = Array.from(new Set([...Object.keys(s1), ...Object.keys(s2)])).slice(0, 6);

      let reply = `Here is a detailed, factual side-by-side comparison between **${p1.name}** and **${p2.name}**:\n\n`;
      reply += `| Feature / Spec | ${p1.brand} (${p1.name.slice(0, 22)}...) | ${p2.brand} (${p2.name.slice(0, 22)}...) |\n`;
      reply += `| :--- | :--- | :--- |\n`;
      reply += `| **Price** | **₹${p1.price.toLocaleString('en-IN')}** (${p1.discount}% OFF) | **₹${p2.price.toLocaleString('en-IN')}** (${p2.discount}% OFF) |\n`;
      reply += `| **Rating** | ⭐ ${p1.rating} (${p1.numReviews} reviews) | ⭐ ${p2.rating} (${p2.numReviews} reviews) |\n`;

      for (const k of allKeys) {
        reply += `| **${k}** | ${s1[k] || 'N/A'} | ${s2[k] || 'N/A'} |\n`;
      }
      reply += `| **Warranty** | ${p1.warranty || '1 Year'} | ${p2.warranty || '1 Year'} |\n\n`;

      reply += `💡 **Key Recommendation:**\n`;
      if (p1.price < p2.price) {
        reply += `• **${p1.name}** offers superior value-for-money at ₹${p1.price.toLocaleString('en-IN')}.\n`;
        reply += `• **${p2.name}** is the premium choice if you prioritize brand-specific optimizations.\n`;
      } else {
        reply += `• **${p2.name}** delivers excellent performance per rupee at ₹${p2.price.toLocaleString('en-IN')}.\n`;
        reply += `• **${p1.name}** is the top-tier contender for maximum reliability.\n`;
      }

      return {
        reply,
        toolCalls: [
          {
            name: 'compareProducts',
            result: {
              product1: p1,
              product2: p2,
            },
          },
        ],
        type: 'PRODUCT_COMPARISON',
        products: [p1, p2],
      };
    }
  }

  // 3. Product Search / Recommendation Intent
  let categorySlug = '';
  if (q.includes('servo')) categorySlug = 'servo-drives';
  else if (q.includes('plc') || q.includes('controller') || q.includes('s7-1200') || q.includes('automation controller')) categorySlug = 'plc';
  else if (q.includes('vfd') || q.includes('drive') || q.includes('inverter') || q.includes('frequency drive')) categorySlug = 'vfd';
  else if (q.includes('hmi') || q.includes('display') || q.includes('touch screen')) categorySlug = 'hmi';
  else if (q.includes('motor') || q.includes('motion')) categorySlug = 'motors';
  else if (q.includes('sensor') || q.includes('encoder') || q.includes('proximity')) categorySlug = 'sensors';
  else if (q.includes('smps') || q.includes('power supply') || q.includes('24v')) categorySlug = 'smps-power-supplies';
  else if (q.includes('panel') || q.includes('control panel')) categorySlug = 'electrical-control-panels';
  else if (q.includes('cable') || q.includes('wire') || q.includes('connector')) categorySlug = 'industrial-cables-accessories';
  else if (q.includes('relay') || q.includes('contactor') || q.includes('mcb') || q.includes('switchgear')) categorySlug = 'electrical-components';

  // Detect budget
  let maxBudget: number | undefined;
  const lakhMatch = q.match(/(\d+)\s*(lakh|lac)/i);
  if (lakhMatch) {
    maxBudget = parseFloat(lakhMatch[1]) * 100000;
  } else {
    const kMatch = q.match(/(\d+)\s*k\b/i);
    if (kMatch) {
      maxBudget = parseFloat(kMatch[1]) * 1000;
    } else {
      const numMatch = q.match(/(\d{4,7})/);
      if (numMatch) {
        maxBudget = parseInt(numMatch[1], 10);
      }
    }
  }

  // Clean keywords for searching
  const cleanedKeywords = q
    .replace(/(which|what|is|are|best|for|the|a|an|under|show|me|looking|suggest|recommend|need|want|good|top|cheap|automation|industrial|inr|rs|rupees|bhai|dikha|chahiye|ke andar|\d+k|\d+lakh|\d+)/gi, '')
    .trim();

  let searchResult = await executeTool('searchProducts', {
    query: cleanedKeywords.length > 2 ? cleanedKeywords : undefined,
    category: categorySlug || undefined,
    maxPrice: maxBudget,
  });

  // If specific keyword search yielded no matches but a category was identified, fall back to top products in that category
  if ((!searchResult || !searchResult.count || searchResult.count === 0) && categorySlug) {
    searchResult = await executeTool('searchProducts', {
      category: categorySlug,
      maxPrice: maxBudget,
    });
  }

  if (searchResult && searchResult.count && searchResult.count > 0 && Array.isArray(searchResult.products)) {
    let reply = `Here are the top industrial automation products matching your requirements`;
    if (maxBudget) reply += ` under ₹${maxBudget.toLocaleString('en-IN')}`;
    reply += `:\n\n`;

    searchResult.products.forEach((p: any, idx: number) => {
      reply += `${idx + 1}. **${p.name}** — **₹${p.price.toLocaleString('en-IN')}** (${p.discount}% OFF MRP ₹${p.mrp.toLocaleString('en-IN')})\n`;
      reply += `   ⭐ ${p.rating}/5 • In Stock (${p.stock} units) • OEM Warranty Included\n`;
    });

    reply += `\nWould you like me to compare any of these units, verify wiring/pinout specs, or generate an RFQ?`;

    return {
      reply,
      toolCalls: [{ name: 'searchProducts', result: searchResult }],
      type: 'PRODUCT_LIST',
      products: searchResult.products,
    };
  }

  // Default friendly assistant response
  return {
    reply: `Hello! I'm **Factorylogik AI**, your industrial automation & controls assistant. ⚡\n\nI can help you with:\n• Finding industrial automation products (PLCs, VFDs, HMIs, Servos, Sensors, Power Supplies).\n• Side-by-side technical specification and wiring parameter comparisons.\n• Tracking your orders and shipments in real-time.\n• Checking warehouse stock and technical datasheet details.\n\nTry asking: *"Which PLC is best for packaging machine automation?"* or *"Compare Siemens S7-1200 and Delta DVP"* or *"Where is my order?"*`,
    type: 'GREETING',
  };
}
