const mongoose = require('mongoose');
const uuid = require('uuid');

const ListSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
    immutable: true
  },
  name: {
    type: String,
    required: true
  },
  boardId: {
    type: String,
    ref: 'Board'
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  // https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
// https://mongoosejs.com/docs/tutorials/virtuals.html
ListSchema.virtual('board', {
  ref: 'Board',
  localField: 'boardId',
  foreignField: '_id',
  justOne: true
});
ListSchema.virtual('items', {
  ref: 'Item',
  localField: '_id',
  foreignField: 'listId',
});
ListSchema.pre('save', function() {
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

module.exports = ListSchema;
