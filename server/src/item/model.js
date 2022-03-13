const mongoose = require("mongoose");
const uuid = require("uuid");

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
    required: true
  },
  details: {
    type: String,
    required: false
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
    default: false
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  // https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
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
const ItemModel = mongoose.model('Item', ItemSchema);

module.exports = ItemModel;
