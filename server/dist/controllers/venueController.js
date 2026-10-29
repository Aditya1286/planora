"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVenue = exports.getVenues = void 0;
const Venue_1 = require("../models/Venue");
const auditService_1 = require("../services/auditService");
const getVenues = async (req, res) => {
    try {
        const { city } = req.query;
        const filter = {};
        if (city && city !== 'all') {
            filter.city = { $regex: city, $options: 'i' };
        }
        const venues = await Venue_1.Venue.find(filter).sort({ city: 1, name: 1 });
        res.json({ success: true, data: venues });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching venues.' });
    }
};
exports.getVenues = getVenues;
const createVenue = async (req, res) => {
    try {
        const { name, address, city, state, country, postalCode, capacity, coordinates, amenities, photos } = req.body;
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        const venue = await Venue_1.Venue.create({
            name,
            slug,
            address,
            city,
            state: state || '',
            country: country || 'United States',
            postalCode: postalCode || '',
            capacity: Number(capacity) || 100,
            coordinates: coordinates || { lat: 40.7128, lng: -74.006 },
            amenities: amenities || [],
            photos: photos || [],
        });
        await (0, auditService_1.logAudit)({
            userId: req.user?._id,
            userEmail: req.user?.email,
            action: 'VENUE_CREATED',
            entityType: 'Venue',
            entityId: venue._id.toString(),
            req,
        });
        res.status(201).json({ success: true, message: 'Venue created successfully.', data: venue });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error creating venue.' });
    }
};
exports.createVenue = createVenue;
