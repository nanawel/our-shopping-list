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
    immutable: true,
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
BoardSchema.pre('validate', function() {
  if (!this.name && this.slug) {
    this.name = slug;
  }
  if (!this.slug && this.name) {
    this.slug = this.name;
  }
  this.slug = slugify(this.slug);
});
const BoardModel = mongoose.model('Board', BoardSchema);

module.exports = BoardModel;
