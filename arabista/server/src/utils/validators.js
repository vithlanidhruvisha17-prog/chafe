const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
  }),
});

const deleteImageSchema = z.object({
  body: z.object({
    path: z
      .string({ required_error: 'Image path or URL is required' })
      .min(1, 'Image path or URL cannot be empty'),
  }),
});

// Helper for coercing optional number from string or number
const optionalNumber = z.preprocess((val) => {
  if (val === undefined || val === null || val === '') return undefined;
  const num = Number(val);
  return isNaN(num) ? val : num;
}, z.number().optional());

// Helper for coercing required number
const requiredNumber = z.preprocess((val) => {
  if (val === undefined || val === null || val === '') return undefined;
  const num = Number(val);
  return isNaN(num) ? val : num;
}, z.number({ required_error: 'Price/SortOrder number is required' }));

// Helper for coercing boolean from string or boolean
const coerceBoolean = z.preprocess((val) => {
  if (val === undefined || val === null || val === '') return undefined;
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return val;
}, z.boolean().optional());

const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Category name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    slug: z.string().trim().optional(),
    sortOrder: optionalNumber.default(0),
    imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    slug: z.string().trim().optional(),
    sortOrder: optionalNumber,
    imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  }),
});

const createSubCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Subcategory name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    categoryId: z.string({ required_error: 'Parent categoryId is required' }).uuid('Invalid Category ID format'),
    slug: z.string().trim().optional(),
    sortOrder: optionalNumber.default(0),
    imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  }),
});

const updateSubCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    categoryId: z.string().uuid('Invalid Category ID format').optional(),
    slug: z.string().trim().optional(),
    sortOrder: optionalNumber,
    imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  }),
});

const createMenuItemSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Item name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    description: z.string().trim().optional().nullable(),
    price: requiredNumber.refine((val) => val >= 0, 'Price must be greater than or equal to 0'),
    subCategoryId: z.string({ required_error: 'subCategoryId is required' }).uuid('Invalid SubCategory ID format'),
    imageUrl: z.string().url('Invalid image URL').optional().nullable(),
    isAvailable: coerceBoolean.default(true),
    isSignature: coerceBoolean.default(false),
    sortOrder: optionalNumber.default(0),
  }),
});

const updateMenuItemSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    description: z.string().trim().optional().nullable(),
    price: optionalNumber.refine((val) => val === undefined || val >= 0, 'Price must be >= 0'),
    subCategoryId: z.string().uuid('Invalid SubCategory ID format').optional(),
    imageUrl: z.string().url('Invalid image URL').optional().nullable(),
    isAvailable: coerceBoolean,
    isSignature: coerceBoolean,
    sortOrder: optionalNumber,
  }),
});

const createBannerSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Banner title is required' }).trim().min(2),
    subtitle: z.string().trim().optional().nullable(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    linkUrl: z.string().trim().optional().nullable(),
    isActive: coerceBoolean.default(true),
    sortOrder: optionalNumber.default(0),
  }),
});

const updateBannerSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).optional(),
    subtitle: z.string().trim().optional().nullable(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    linkUrl: z.string().trim().optional().nullable(),
    isActive: coerceBoolean,
    sortOrder: optionalNumber,
  }),
});

const createGallerySchema = z.object({
  body: z.object({
    title: z.string().trim().optional().nullable(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    isActive: coerceBoolean.default(true),
    sortOrder: optionalNumber.default(0),
  }),
});

const updateGallerySchema = z.object({
  body: z.object({
    title: z.string().trim().optional().nullable(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    isActive: coerceBoolean,
    sortOrder: optionalNumber,
  }),
});

const createOrderSchema = z.object({
  body: z
    .object({
      type: z.enum(['DINE_IN', 'TAKEAWAY'], {
        required_error: 'Order type (DINE_IN or TAKEAWAY) is required',
      }),
      tableNumber: z.string().trim().optional().nullable(),
      customerName: z
        .string({ required_error: 'Customer name is required' })
        .trim()
        .min(2, 'Customer name must be at least 2 characters'),
      phone: z
        .string({ required_error: 'Phone number is required' })
        .trim()
        .regex(/^[0-9+\s\-]{7,15}$/, 'Invalid phone number format (7 to 15 digits)'),
      items: z
        .array(
          z.object({
            menuItemId: z.string({ required_error: 'menuItemId is required' }).uuid('Invalid menuItemId format'),
            quantity: z.preprocess((val) => Number(val), z.number().int().positive('Quantity must be at least 1')),
          })
        )
        .min(1, 'Order must contain at least one item'),
    })
    .refine(
      (data) => {
        if (data.type === 'DINE_IN') {
          return Boolean(data.tableNumber && data.tableNumber.trim().length > 0);
        }
        return true;
      },
      {
        message: 'Table number is required for DINE_IN orders',
        path: ['tableNumber'],
      }
    ),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PLACED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'], {
      required_error: 'Valid order status is required',
    }),
  }),
});

module.exports = {
  loginSchema,
  deleteImageSchema,
  createCategorySchema,
  updateCategorySchema,
  createSubCategorySchema,
  updateSubCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  createBannerSchema,
  updateBannerSchema,
  createGallerySchema,
  updateGallerySchema,
  createOrderSchema,
  updateOrderStatusSchema,
};
