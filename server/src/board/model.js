const mongoose = require("mongoose");
const uuid = require("uuid");
const slugify = require("slugify");

const BoardSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
    immutable: true
  },
  slug: {
    type: String,
    default: () => slugify(this.name),
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  // https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
// https://mongoosejs.com/docs/tutorials/virtuals.html
BoardSchema.virtual('lists', {
  ref: 'List',
  localField: '_id',
  foreignField: 'boardId',
});
BoardSchema.pre('save', function() {
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
const BoardModel = mongoose.model('Board', BoardSchema);

module.exports = BoardModel;
