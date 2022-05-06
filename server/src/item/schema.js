const mongoose = require('mongoose');
const uuid = require('uuid');

const ItemSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
    immutable: true
  },
  listId: {
    type: String,
    ref: 'List'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255
  },
  details: {
    type: String,
    required: false,
    maxLength: 1024
  },
  qty: {
    type: Number,
    default: 1
  },
  checked: {
    type: Boolean,
    default: false
  },
  lastCheckedAt: {
    type: Date,
    default: undefined
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  // https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
ItemSchema.virtual('list', {
  ref: 'List',
  localField: 'listId',
  foreignField: '_id',
  justOne: true
});
ItemSchema.pre('save', function() {
  // < v1.0.2 format compatibility hook
  if (!this.createdAt && this.creationDate) {
    this.createdAt = this.creationDate;
  }
  this.set('creationDate', undefined, { strict: false });
  if (!this.updatedAt && this.lastModificationDate) {
    this.updatedAt = this.lastModificationDate;
  }
  this.set('lastModificationDate', undefined, { strict: false });
});
ItemSchema.pre('save', function() {
  if (this.isModified('checked') && this.checked) {
    this.lastCheckedAt = new Date().toISOString();
  }
});

module.exports = ItemSchema;
