"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SessionSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    track: { type: String, default: 'Main Stage' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    speakerNames: [{ type: String }],
    location: { type: String, default: '' },
});
const SpeakerSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    bio: { type: String, default: '' },
    photo: { type: String, default: '' },
    socialLinks: {
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        website: { type: String, default: '' },
    },
});
const SponsorSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    tier: {
        type: String,
        enum: ['Platinum', 'Gold', 'Silver', 'Community'],
        default: 'Gold',
    },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
});
const EventSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, required: true },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    organizerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    venueId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Venue', index: true },
    format: {
        type: String,
        enum: ['in-person', 'online', 'hybrid'],
        required: true,
        default: 'in-person',
        index: true,
    },
    onlineUrl: { type: String, default: '' },
    coverImage: { type: String, required: true },
    galleryImages: [{ type: String }],
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    capacity: { type: Number, required: true, min: 1 },
    remainingCapacity: { type: Number, required: true, min: 0 },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
        index: true,
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled', 'completed'],
        default: 'published',
        index: true,
    },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false, index: true },
    cancellationReason: { type: String, default: '' },
    sessions: [SessionSchema],
    speakers: [SpeakerSchema],
    sponsors: [SponsorSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
}, {
    timestamps: true,
});
// Compound indexes
EventSchema.index({ status: 1, startDate: 1 });
EventSchema.index({ organizerId: 1, status: 1 });
EventSchema.index({ categoryId: 1, status: 1 });
EventSchema.index({ title: 'text', description: 'text', tags: 'text' });
exports.Event = mongoose_1.default.model('Event', EventSchema);
