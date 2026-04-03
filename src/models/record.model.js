const mongoose = require('mongoose');

const RECORD_TYPES = ['income', 'expense'];
const CATEGORIES = [
  'salary',
  'freelance',
  'investment',
  'rental',
  'business',
  'food',
  'transport',
  'utilities',
  'healthcare',
  'education',
  'entertainment',
  'shopping',
  'travel',
  'insurance',
  'taxes',
  'other',
];

const financialRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Record must belong to a user'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Record type is required'],
      enum: {
        values: RECORD_TYPES,
        message: 'Type must be either income or expense',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Compound Indexes for Query Optimization ──────────────────────────────────
financialRecordSchema.index({ user: 1, date: -1 });
financialRecordSchema.index({ user: 1, type: 1 });
financialRecordSchema.index({ user: 1, category: 1 });
financialRecordSchema.index({ user: 1, isDeleted: 1, date: -1 });

// ─── Query Middleware: Exclude Soft-Deleted Records by Default ────────────────
financialRecordSchema.pre(/^find/, function (next) {
  if (!this.getQuery().hasOwnProperty('isDeleted')) {
    this.where({ isDeleted: false });
  }
  next();
});

// ─── Static Helpers ───────────────────────────────────────────────────────────
financialRecordSchema.statics.TYPES = RECORD_TYPES;
financialRecordSchema.statics.CATEGORIES = CATEGORIES;

const FinancialRecord = mongoose.model('FinancialRecord', financialRecordSchema);
module.exports = FinancialRecord;
