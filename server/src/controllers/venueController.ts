import { Request, Response } from 'express';
import { Venue } from '../models/Venue';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditService';

export const getVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city } = req.query as Record<string, string>;
    const filter: any = {};
    if (city && city !== 'all') {
      filter.city = { $regex: city, $options: 'i' };
    }

    const venues = await Venue.find(filter).sort({ city: 1, name: 1 });
    res.json({ success: true, data: venues });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching venues.' });
  }
};

export const createVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, address, city, state, country, postalCode, capacity, coordinates, amenities, photos } = req.body;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const venue = await Venue.create({
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

    await logAudit({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: 'VENUE_CREATED',
      entityType: 'Venue',
      entityId: venue._id.toString(),
      req,
    });

    res.status(201).json({ success: true, message: 'Venue created successfully.', data: venue });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating venue.' });
  }
};
