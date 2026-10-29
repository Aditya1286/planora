"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyFavorites = exports.toggleFavorite = void 0;
const Favorite_1 = require("../models/Favorite");
const toggleFavorite = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const { eventId } = req.body;
        const existing = await Favorite_1.Favorite.findOne({ userId: req.user._id, eventId });
        if (existing) {
            await Favorite_1.Favorite.deleteOne({ _id: existing._id });
            res.json({
                success: true,
                isFavorited: false,
                message: 'Event removed from your saved list.',
            });
            return;
        }
        await Favorite_1.Favorite.create({
            userId: req.user._id,
            eventId,
        });
        res.status(201).json({
            success: true,
            isFavorited: true,
            message: 'Event added to your saved list!',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error toggling favorite.' });
    }
};
exports.toggleFavorite = toggleFavorite;
const getMyFavorites = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const favorites = await Favorite_1.Favorite.find({ userId: req.user._id })
            .populate({
            path: 'eventId',
            populate: [
                { path: 'venueId', select: 'name city' },
                { path: 'categoryId', select: 'name color' },
                { path: 'organizerId', select: 'name avatar' },
            ],
        })
            .sort({ createdAt: -1 });
        const validFavorites = favorites
            .filter((f) => f.eventId != null)
            .map((f) => f.eventId);
        res.json({
            success: true,
            data: validFavorites,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching favorites.' });
    }
};
exports.getMyFavorites = getMyFavorites;
