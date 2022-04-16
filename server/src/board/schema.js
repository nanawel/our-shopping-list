const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const uuid = require('uuid');
const slugify = require('slugify');

const BoardSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
    immutable: true
  },
  slug: {
    type: String,
    /**
     * Not a validator here, only used to build an index. See also uniqueValidator plugin.
     * @see https://mongoosejs.com/docs/validation.html#the-unique-option-is-not-a-validator
     * @see https://www.npmjs.com/package/mongoose-unique-validator
     */
    unique: true,
    immutable: true,
    required: true,
    trim: true
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
    this.name = this.slug;
  }
  if (!this.slug && this.name) {
    this.slug = this.name;
  }
  this.slug = slugify(this.slug, {lower: true});
});
BoardSchema.plugin(uniqueValidator);

module.exports = BoardSchema;
