"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../config/db");
const models_1 = require("../models");
const seedDatabase = async () => {
    console.log('\n🌱 Starting Planora database seeding process...');
    await (0, db_1.connectDB)();
    // 1. Clean existing collections
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
        models_1.User.deleteMany({}),
        models_1.Category.deleteMany({}),
        models_1.Venue.deleteMany({}),
        models_1.Event.deleteMany({}),
        models_1.TicketType.deleteMany({}),
        models_1.Booking.deleteMany({}),
        models_1.PromoCode.deleteMany({}),
        models_1.Review.deleteMany({}),
        models_1.Favorite.deleteMany({}),
        models_1.Notification.deleteMany({}),
        models_1.AuditLog.deleteMany({}),
    ]);
    // 2. Seed Users (~32 users across admin, organizer, attendee)
    console.log('👥 Seeding users with hashed passwords...');
    const salt = await bcryptjs_1.default.genSalt(10);
    const adminPasswordHash = await bcryptjs_1.default.hash('Admin123!', salt);
    const organizerPasswordHash = await bcryptjs_1.default.hash('Organizer123!', salt);
    const attendeePasswordHash = await bcryptjs_1.default.hash('Attendee123!', salt);
    const usersData = [
        // Primary Demo Accounts
        {
            name: 'Elena Rostova',
            email: 'admin@planora.dev',
            passwordHash: adminPasswordHash,
            role: 'admin',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
            bio: 'Head of Platform Operations at Planora. Passionate about community gatherings and seamless live experiences.',
            organization: 'Planora Global HQ',
            website: 'https://planora.dev',
            city: 'San Francisco',
            isVerified: true,
            status: 'active',
        },
        {
            name: 'Marcus Vance',
            email: 'organizer@planora.dev',
            passwordHash: organizerPasswordHash,
            role: 'organizer',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            bio: 'Lead Producer at Vanguard Events. Organizing premier tech and design summits across North America and Europe.',
            organization: 'Vanguard Events Collective',
            website: 'https://vanguardevents.example.com',
            city: 'New York',
            isVerified: true,
            status: 'active',
        },
        {
            name: 'Aria Chen',
            email: 'attendee@planora.dev',
            passwordHash: attendeePasswordHash,
            role: 'attendee',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
            bio: 'Product Designer & avid festival enthusiast. Always looking for the next spark of inspiration.',
            organization: 'Studio Lumen',
            website: 'https://ariachen.design',
            city: 'Austin',
            isVerified: true,
            status: 'active',
        },
        // Additional Organizers
        {
            name: 'Sofia Martinez',
            email: 'sofia@apexsummits.com',
            passwordHash: organizerPasswordHash,
            role: 'organizer',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
            bio: 'Director of Experiences at Apex Global Summits.',
            organization: 'Apex Global',
            city: 'Chicago',
            status: 'active',
        },
        {
            name: 'Liam Davies',
            email: 'liam@soundwavepresents.co.uk',
            passwordHash: organizerPasswordHash,
            role: 'organizer',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
            bio: 'Music festival curator & promoter.',
            organization: 'Soundwave Festival Group',
            city: 'London',
            status: 'active',
        },
        {
            name: 'Dr. Hiroshi Tanaka',
            email: 'tanaka@futurehealth.jp',
            passwordHash: organizerPasswordHash,
            role: 'organizer',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
            bio: 'Biomedical Conference Organizer and Research Fellow.',
            organization: 'Tokyo Health Horizons',
            city: 'Tokyo',
            status: 'active',
        },
        {
            name: 'Amara Okafor',
            email: 'amara@artisancreatives.org',
            passwordHash: organizerPasswordHash,
            role: 'organizer',
            avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
            bio: 'Contemporary arts producer and cultural curator.',
            organization: 'Heritage & Modern Arts',
            city: 'Toronto',
            status: 'active',
        },
        {
            name: 'Julien Laurent',
            email: 'julien@gastronomy.fr',
            passwordHash: organizerPasswordHash,
            role: 'organizer',
            avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
            bio: 'Sommelier and international culinary festival director.',
            organization: 'French Culinary Federation',
            city: 'Paris',
            status: 'active',
        },
        // Additional Attendees (25 realistic attendees)
        ...Array.from({ length: 25 }, (_, i) => {
            const firstNames = ['David', 'Maya', 'Lucas', 'Zara', 'Ethan', 'Chloe', 'Oliver', 'Mia', 'Noah', 'Ava', 'Gabriel', 'Layla', 'Samuel', 'Isla', 'Leo', 'Freya', 'Henry', 'Grace', 'Daniel', 'Zoe', 'Alexander', 'Hannah', 'Sebastian', 'Emily', 'William'];
            const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark'];
            const cities = ['New York', 'San Francisco', 'Austin', 'Seattle', 'London', 'Berlin', 'Toronto', 'Chicago', 'Boston', 'Los Angeles', 'Denver', 'Paris', 'Tokyo', 'Sydney'];
            const name = `${firstNames[i]} ${lastNames[i]}`;
            return {
                name,
                email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}${i + 1}@example.com`,
                passwordHash: attendeePasswordHash,
                role: 'attendee',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
                bio: `Enthusiast for live events and networking.`,
                organization: `${lastNames[i]} Innovations`,
                city: cities[i % cities.length],
                status: 'active',
                isVerified: true,
            };
        }),
    ];
    const createdUsers = await models_1.User.insertMany(usersData);
    const adminUser = createdUsers.find((u) => u.email === 'admin@planora.dev');
    const primaryOrganizer = createdUsers.find((u) => u.email === 'organizer@planora.dev');
    const allOrganizers = createdUsers.filter((u) => u.role === 'organizer');
    const allAttendees = createdUsers.filter((u) => u.role === 'attendee');
    console.log(`✅ Created ${createdUsers.length} users.`);
    // 3. Seed Categories (12 distinct categories)
    console.log('🏷️ Seeding categories...');
    const categoriesData = [
        {
            name: 'Technology & AI',
            slug: 'technology-ai',
            description: 'Cutting-edge tech conferences, developer summits, and artificial intelligence workshops.',
            icon: 'Cpu',
            color: '#0047AB',
            coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
            isFeatured: true,
        },
        {
            name: 'Music & Festivals',
            slug: 'music-festivals',
            description: 'Live concerts, underground electro, indie showcases, and grand outdoor festivals.',
            icon: 'Music',
            color: '#FFC93C',
            coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
            isFeatured: true,
        },
        {
            name: 'Business & Startups',
            slug: 'business-startups',
            description: 'Venture pitch days, founder roundtables, leadership summits, and investor showcases.',
            icon: 'Briefcase',
            color: '#1A1A2E',
            coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
            isFeatured: true,
        },
        {
            name: 'Design & Creative',
            slug: 'design-creative',
            description: 'UX/UI design masterclasses, product design expos, typography jams, and creative retreats.',
            icon: 'Palette',
            color: '#E8DCC8',
            coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
            isFeatured: true,
        },
        {
            name: 'Food & Culinary',
            slug: 'food-culinary',
            description: 'Michelin tastings, artisan wine tours, street food carnivals, and chef cook-offs.',
            icon: 'Utensils',
            color: '#FFC93C',
            coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
            isFeatured: true,
        },
        {
            name: 'Health & Wellness',
            slug: 'health-wellness',
            description: 'Holistic yoga retreats, mental health conferences, biohacking summits, and fitness expos.',
            icon: 'Heart',
            color: '#0047AB',
            coverImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
            isFeatured: true,
        },
        {
            name: 'Science & Aerospace',
            slug: 'science-aerospace',
            description: 'Space exploration talks, quantum physics conventions, and deep-tech panels.',
            icon: 'Compass',
            color: '#1A1A2E',
            coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
            isFeatured: false,
        },
        {
            name: 'Film & Media',
            slug: 'film-media',
            description: 'Independent film premieres, screenwriter workshops, docuseries showcases, and animation.',
            icon: 'Film',
            color: '#0047AB',
            coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
            isFeatured: false,
        },
        {
            name: 'Gaming & Esports',
            slug: 'gaming-esports',
            description: 'Competitive arena tournaments, indie game demos, VR experiences, and game dev summits.',
            icon: 'Gamepad2',
            color: '#FFC93C',
            coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
            isFeatured: false,
        },
        {
            name: 'Community & Networking',
            slug: 'community-networking',
            description: 'Local neighborhood mixers, alumni reunions, hobbyist meetups, and volunteer drives.',
            icon: 'Users',
            color: '#E8DCC8',
            coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
            isFeatured: false,
        },
    ];
    const createdCategories = await models_1.Category.insertMany(categoriesData);
    console.log(`✅ Created ${createdCategories.length} categories.`);
    // 4. Seed Venues (16 real venues across key cities)
    console.log('🏛️ Seeding venues...');
    const venuesData = [
        {
            name: 'Metropolitan Pavilion',
            slug: 'metropolitan-pavilion-nyc',
            address: '125 W 18th St',
            city: 'New York',
            state: 'NY',
            country: 'United States',
            postalCode: '10011',
            capacity: 1200,
            coordinates: { lat: 40.7402, lng: -73.9982 },
            amenities: ['High-speed Fiber WiFi', 'Full AV Production', 'Loading Dock', 'Breakout Rooms', 'Catering Kitchen'],
            photos: ['https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'Moscone Convention Center',
            slug: 'moscone-center-sf',
            address: '747 Howard St',
            city: 'San Francisco',
            state: 'CA',
            country: 'United States',
            postalCode: '94103',
            capacity: 5000,
            coordinates: { lat: 37.7842, lng: -122.4016 },
            amenities: ['Gigabit Wireless', 'Keynote Auditorium', 'Exhibition Halls', 'Green Rooms', 'Transit Adjacent'],
            photos: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'Austin Convention & Arts Hall',
            slug: 'austin-arts-hall',
            address: '500 E Cesar Chavez St',
            city: 'Austin',
            state: 'TX',
            country: 'United States',
            postalCode: '78701',
            capacity: 2500,
            coordinates: { lat: 30.2636, lng: -97.7397 },
            amenities: ['Outdoor Terrace', 'Solar Powered', 'Live Streaming Rig', 'Craft Beer Bar'],
            photos: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'Tobacco Dock',
            slug: 'tobacco-dock-london',
            address: 'Tobacco Quay, Wapping Ln',
            city: 'London',
            state: 'England',
            country: 'United Kingdom',
            postalCode: 'E1W 2SF',
            capacity: 3000,
            coordinates: { lat: 51.5074, lng: -0.0601 },
            amenities: ['Historic Vaults', 'Quayside Courtyard', 'Ultra-fast Connectivity', 'Multiple Stages'],
            photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'Funkhaus Berlin',
            slug: 'funkhaus-berlin',
            address: 'Nalepastraße 18',
            city: 'Berlin',
            country: 'Germany',
            postalCode: '12459',
            capacity: 1800,
            coordinates: { lat: 52.4897, lng: 13.4984 },
            amenities: ['Acoustic Recording Halls', 'Spree River View', 'Industrial Architecture', 'Sound Lab'],
            photos: ['https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'Palais Brongniart',
            slug: 'palais-brongniart-paris',
            address: '16 Place de la Bourse',
            city: 'Paris',
            country: 'France',
            postalCode: '75002',
            capacity: 1400,
            coordinates: { lat: 48.8689, lng: 2.3414 },
            amenities: ['Neo-Classical Grand Nave', 'Press Lounge', 'VIP Mezzanine', 'Central Metro Access'],
            photos: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'Tokyo Midtown Hall',
            slug: 'tokyo-midtown-hall',
            address: '9-7-1 Akasaka, Minato City',
            city: 'Tokyo',
            country: 'Japan',
            postalCode: '107-0052',
            capacity: 1500,
            coordinates: { lat: 35.6657, lng: 139.731 },
            amenities: ['Bilingual AV Booths', 'Subway Direct Link', 'LED Stage Walls', 'Press Room'],
            photos: ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'Metro Toronto Convention Centre',
            slug: 'metro-toronto-center',
            address: '255 Front St W',
            city: 'Toronto',
            state: 'ON',
            country: 'Canada',
            postalCode: 'M5V 2W6',
            capacity: 4000,
            coordinates: { lat: 43.6436, lng: -79.3871 },
            amenities: ['CN Tower Views', 'LEED Gold Certified', 'Grand Ballroom', 'Underground Parking'],
            photos: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'The Glasshouse',
            slug: 'the-glasshouse-nyc',
            address: '660 12th Ave',
            city: 'New York',
            state: 'NY',
            country: 'United States',
            postalCode: '10019',
            capacity: 1850,
            coordinates: { lat: 40.767, lng: -73.997 },
            amenities: ['Hudson River Panoramic Views', 'Outdoor Terraces', 'Integrated DMX Lighting'],
            photos: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'Navy Pier Aon Grand Ballroom',
            slug: 'navy-pier-chicago',
            address: '600 E Grand Ave',
            city: 'Chicago',
            state: 'IL',
            country: 'United States',
            postalCode: '60611',
            capacity: 2200,
            coordinates: { lat: 41.8917, lng: -87.6086 },
            amenities: ['Lake Michigan Panoramas', '80ft Domed Ceiling', 'Historic Stage'],
            photos: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'ICC Sydney Grand Theatre',
            slug: 'icc-sydney',
            address: '14 Darling Dr',
            city: 'Sydney',
            state: 'NSW',
            country: 'Australia',
            postalCode: '2000',
            capacity: 3500,
            coordinates: { lat: -33.8767, lng: 151.1994 },
            amenities: ['Darling Harbour Views', 'Tiered Amphitheater', 'Broadcast Studio'],
            photos: ['https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'Museum of Pop Culture (MoPOP)',
            slug: 'mopop-seattle',
            address: '325 5th Ave N',
            city: 'Seattle',
            state: 'WA',
            country: 'United States',
            postalCode: '98109',
            capacity: 1000,
            coordinates: { lat: 47.6215, lng: -122.3481 },
            amenities: ['Sky Church Huge LED', 'Frank Gehry Design', 'Interactive Exhibits'],
            photos: ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'KRAFTWERK Berlin',
            slug: 'kraftwerk-berlin',
            address: 'Köpenicker Str. 70',
            city: 'Berlin',
            country: 'Germany',
            postalCode: '10179',
            capacity: 2800,
            coordinates: { lat: 52.5109, lng: 13.4182 },
            amenities: ['Massive Concrete Atrium', 'Modular Trussing', 'Sub-bass Sound System'],
            photos: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'The Midway SF',
            slug: 'the-midway-sf',
            address: '900 Marin St',
            city: 'San Francisco',
            state: 'CA',
            country: 'United States',
            postalCode: '94124',
            capacity: 2000,
            coordinates: { lat: 37.7516, lng: -122.387 },
            amenities: ['Patio & Indoor Stages', 'Culinary Lab', 'Art Gallery Space'],
            photos: ['https://images.unsplash.com/photo-1471967183320-ee018f6e114a?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'Station F Halle Freyssinet',
            slug: 'station-f-paris',
            address: '5 Parvis Alan Turing',
            city: 'Paris',
            country: 'France',
            postalCode: '75013',
            capacity: 1600,
            coordinates: { lat: 48.8351, lng: 2.3707 },
            amenities: ['Startup Campus', 'Auditorium Master Stage', 'La Felicità Dining'],
            photos: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'],
        },
        {
            name: 'Red Rocks Amphitheatre',
            slug: 'red-rocks-colorado',
            address: '18300 W Alameda Pkwy',
            city: 'Denver',
            state: 'CO',
            country: 'United States',
            postalCode: '80465',
            capacity: 9500,
            coordinates: { lat: 39.6654, lng: -105.2057 },
            amenities: ['Natural Acoustic Geology', 'Open-Air Starlight', 'Iconic Monoliths'],
            photos: ['https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80'],
        },
    ];
    const createdVenues = await models_1.Venue.insertMany(venuesData);
    console.log(`✅ Created ${createdVenues.length} venues.`);
    // 5. Seed Promo Codes
    console.log('🎟️ Seeding promo codes...');
    const promoCodesData = [
        {
            code: 'PLANORA20',
            discountType: 'percentage',
            discountValue: 20,
            maxDiscount: 100,
            minOrderValue: 50,
            maxUses: 500,
            usedCount: 42,
            validFrom: new Date('2026-01-01'),
            validUntil: new Date('2027-12-31'),
            isActive: true,
        },
        {
            code: 'EARLYBIRD30',
            discountType: 'percentage',
            discountValue: 30,
            maxDiscount: 150,
            minOrderValue: 80,
            maxUses: 200,
            usedCount: 88,
            validFrom: new Date('2026-01-01'),
            validUntil: new Date('2027-12-31'),
            isActive: true,
        },
        {
            code: 'VIP50',
            discountType: 'fixed',
            discountValue: 50,
            minOrderValue: 150,
            maxUses: 100,
            usedCount: 19,
            validFrom: new Date('2026-01-01'),
            validUntil: new Date('2027-12-31'),
            isActive: true,
        },
        {
            code: 'WELCOME10',
            discountType: 'percentage',
            discountValue: 10,
            maxUses: 1000,
            usedCount: 154,
            validFrom: new Date('2026-01-01'),
            validUntil: new Date('2027-12-31'),
            isActive: true,
        },
    ];
    await models_1.PromoCode.insertMany(promoCodesData);
    // 6. Seed 65+ Realistic Events across categories & statuses
    console.log('📅 Seeding 65+ realistic events with sessions, speakers, and sponsors...');
    const eventTemplates = [
        {
            title: 'Global AI Summit: Frontiers of Foundation Models',
            categorySlug: 'technology-ai',
            format: 'hybrid',
            shortDescription: 'The defining conference exploring agentic intelligence, neuro-symbolic systems, and high-performance inference at planetary scale.',
            description: 'Join 2,500+ artificial intelligence pioneers, research leads, and systems engineers for three immersive days in San Francisco. Discover how next-generation frontier models are reshaping software design, biomedical synthesis, automated code synthesis, and multi-agent coordination. Features over 40 technical workshops, live model benchmark tournaments, and executive fireside discussions.',
            coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
            galleryImages: [
                'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
            ],
            daysFromNow: 12,
            durationHours: 48,
            capacity: 1200,
            venueIndex: 1, // Moscone Center
            featured: true,
            status: 'published',
            tags: ['AI', 'Machine Learning', 'Autonomous Agents', 'Deep Learning', 'Foundational Models'],
        },
        {
            title: 'Neon Horizons Electronic Music Festival 2026',
            categorySlug: 'music-festivals',
            format: 'in-person',
            shortDescription: 'A multi-stage celebration of analog modular synth, experimental ambient, and pulsating live techno.',
            description: 'Set against the breathtaking red sandstone monoliths of Colorado, Neon Horizons brings together 30+ world-class audio architects and visual projection artists. Experience 3 nights of spatial Dolby Atmos sound, custom stage pyrotechnics, immersive laser tunnels, and curated organic artisan food villages.',
            coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
            galleryImages: [
                'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
            ],
            daysFromNow: 24,
            durationHours: 60,
            capacity: 3500,
            venueIndex: 15, // Red Rocks
            featured: true,
            status: 'published',
            tags: ['Electronic', 'Concert', 'Live Music', 'Techno', 'Festival'],
        },
        {
            title: 'Fintech Breakthrough & Venture Forum 2026',
            categorySlug: 'business-startups',
            format: 'in-person',
            shortDescription: 'Where global fintech innovators, central bankers, and venture capital partners converge.',
            description: 'Explore the next wave of programmable finance, cross-border settlement rails, agentic payments, and embedded credit architecture. Hosted inside the historic neo-classical grand nave of Palais Brongniart in Paris.',
            coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: 18,
            durationHours: 24,
            capacity: 800,
            venueIndex: 5, // Palais Brongniart Paris
            featured: true,
            status: 'published',
            tags: ['Fintech', 'Venture Capital', 'Finance', 'Startups', 'Banking'],
        },
        {
            title: 'Canvas & Flow: International Product Design Biennial',
            categorySlug: 'design-creative',
            format: 'in-person',
            shortDescription: 'A master gathering of digital product designers, creative technologists, and design system leaders.',
            description: 'An intimate, highly collaborative design gathering exploring tactile interfaces, motion choreographies, generative layout tools, and typography for spatial computing.',
            coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: 30,
            durationHours: 32,
            capacity: 650,
            venueIndex: 0, // Metropolitan Pavilion NYC
            featured: true,
            status: 'published',
            tags: ['Design', 'UX/UI', 'Figma', 'Product Design', 'Typography'],
        },
        {
            title: 'Grand Terroir Wine & Gastronomy Salon',
            categorySlug: 'food-culinary',
            format: 'in-person',
            shortDescription: 'Over 200 premier estate vintners and three-star Michelin masterclasses.',
            description: 'Embark on an exquisite culinary expedition. Taste rare vintage vintages, witness live culinary battles by world-renowned chefs, and experience artisan chocolate and cheese pairings.',
            coverImage: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: 8,
            durationHours: 16,
            capacity: 900,
            venueIndex: 8, // The Glasshouse NYC
            featured: true,
            status: 'published',
            tags: ['Wine Tasting', 'Culinary', 'Gourmet', 'Food', 'Sommelier'],
        },
        {
            title: 'NeuroVibe: Cognitive Longevity & Biohacking Summit',
            categorySlug: 'health-wellness',
            format: 'hybrid',
            shortDescription: 'The future of brain optimization, cellular renewal, and performance medicine.',
            description: 'From circadian neuro-architecture to red light mitochondrial therapies and personalized biomarker nutrition. Listen to leading longevity biologists and clinical practitioners.',
            coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: 40,
            durationHours: 20,
            capacity: 500,
            venueIndex: 2, // Austin Arts Hall
            featured: false,
            status: 'published',
            tags: ['Health', 'Longevity', 'Biohacking', 'Wellness', 'Neuroscience'],
        },
        {
            title: 'Orbital Frontier: Commercial Spaceflight Symposium',
            categorySlug: 'science-aerospace',
            format: 'in-person',
            shortDescription: 'Uniting aerospace engineers, space station architects, and lunar logistics pioneers.',
            description: 'Discuss reusable orbital launch economics, lunar south pole extraction infrastructure, orbital manufacturing of semiconductors, and satellite mega-constellation autonomy.',
            coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: 55,
            durationHours: 36,
            capacity: 1100,
            venueIndex: 6, // Tokyo Midtown Hall
            featured: true,
            status: 'published',
            tags: ['Space', 'Aerospace', 'Astronomy', 'Robotics', 'Science'],
        },
        {
            title: 'KinoSphere: Independent Cinema & Documentary Festival',
            categorySlug: 'film-media',
            format: 'in-person',
            shortDescription: 'A tribute to visionary auteur cinema, bold investigative documentaries, and boundary-pushing shorts.',
            description: 'Over 80 curated films spanning 35 nations, followed by in-depth director Q&A sessions, cinematographic lighting breakdowns, and networking cocktail galas.',
            coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: 15,
            durationHours: 72,
            capacity: 1200,
            venueIndex: 11, // MoPOP Seattle
            featured: false,
            status: 'published',
            tags: ['Cinema', 'Indie Film', 'Documentary', 'Directors', 'Screenwriting'],
        },
        {
            title: 'CyberClash: Masters of Competitive Esports',
            categorySlug: 'gaming-esports',
            format: 'in-person',
            shortDescription: 'The pinnacle clash of 16 premier international gaming squads competing for a $1,000,000 purse.',
            description: 'Live arena high-octane FPS and MOBA matches with 360-degree LED jumbotrons, roaring crowd chants, meet-and-greets with pro casters, and exclusive game studio alpha demos.',
            coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: 20,
            durationHours: 28,
            capacity: 2500,
            venueIndex: 10, // ICC Sydney Grand Theatre
            featured: false,
            status: 'published',
            tags: ['Esports', 'Gaming', 'Tournament', 'Pro Gaming', 'Twitch'],
        },
        {
            title: 'Cloud Native & Distributed Systems World 2026',
            categorySlug: 'technology-ai',
            format: 'in-person',
            shortDescription: 'Kubernetes, multi-cloud resilience, eBPF telemetry, and sub-millisecond edge computing.',
            description: 'Join 1,800 infrastructure architects and site reliability engineers. Deep dive into distributed consensus, deterministic replay debugging, zero-trust network policies, and serverless compute.',
            coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: 5,
            durationHours: 24,
            capacity: 1400,
            venueIndex: 3, // Tobacco Dock London
            featured: true,
            status: 'published',
            tags: ['DevOps', 'Kubernetes', 'Cloud', 'Infrastructure', 'Backend'],
        },
        // Past events for realistic review testing
        {
            title: 'Planora Inaugural Design Conclave 2025',
            categorySlug: 'design-creative',
            format: 'in-person',
            shortDescription: 'The celebrated gathering that kicked off the new design era in downtown Manhattan.',
            description: 'An unforgettable weekend of keynote talks, live brand design redesign sprints, and interactive design critiques.',
            coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: -45, // In the past!
            durationHours: 24,
            capacity: 500,
            venueIndex: 0,
            featured: false,
            status: 'completed',
            tags: ['Design', 'Retrospective', 'UX', 'Conference'],
        },
        {
            title: 'Winter Chamber Music & Acoustic Soirée',
            categorySlug: 'music-festivals',
            format: 'in-person',
            shortDescription: 'Enchanting string quartets and piano sonatas in historic acoustic halls.',
            description: 'A sold-out candlelit celebration of classical mastery and modern minimalist neo-classical compositions.',
            coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: -20, // In the past!
            durationHours: 6,
            capacity: 400,
            venueIndex: 4, // Funkhaus Berlin
            featured: false,
            status: 'completed',
            tags: ['Classical', 'Acoustic', 'Chamber Music', 'Concert'],
        },
        // Draft event
        {
            title: 'Draft: Web3 & Zero Knowledge Summit 2027',
            categorySlug: 'technology-ai',
            format: 'in-person',
            shortDescription: 'ZK-rollups, succinct proofs, and decentralized privacy primitives.',
            description: 'Draft schedule being prepared by the organizer team. Speakers currently confirming availability.',
            coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: 90,
            durationHours: 16,
            capacity: 350,
            venueIndex: 1,
            featured: false,
            status: 'draft',
            tags: ['ZK', 'Cryptography', 'Draft'],
        },
        // Cancelled event
        {
            title: 'Nordic Open Air Tech Sprint (Cancelled)',
            categorySlug: 'technology-ai',
            format: 'in-person',
            shortDescription: 'Cancelled due to severe winter weather warnings across the regional transit corridors.',
            description: 'Originally planned outdoor hackathon. Rescheduling for late spring.',
            coverImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: 14,
            durationHours: 24,
            capacity: 300,
            venueIndex: 4,
            featured: false,
            status: 'cancelled',
            cancellationReason: 'Severe weather alert and public transport shutdowns across regional hubs.',
            tags: ['Hackathon', 'Cancelled'],
        },
    ];
    // Generate 52 additional synthetic events to exceed 65+ total events required
    const additionalEventTitles = [
        { title: 'Full-Stack TypeScript Summit', cat: 'technology-ai', tag: 'TypeScript', fmt: 'online' },
        { title: 'Generative Audio & Sound Synthesis Lab', cat: 'music-festivals', tag: 'Audio', fmt: 'in-person' },
        { title: 'Angel Syndicate Demo Night NYC', cat: 'business-startups', tag: 'Investors', fmt: 'in-person' },
        { title: 'Artisan Sourdough & Fermentation Workshop', cat: 'food-culinary', tag: 'Baking', fmt: 'in-person' },
        { title: 'Mindfulness & Deep Breathwork Retreat', cat: 'health-wellness', tag: 'Meditation', fmt: 'hybrid' },
        { title: 'Spatial Design & VisionOS Masterclass', cat: 'design-creative', tag: 'Spatial', fmt: 'online' },
        { title: 'Quantum Computing Fundamentals & Qubits', cat: 'science-aerospace', tag: 'Quantum', fmt: 'hybrid' },
        { title: 'VR Storytelling & Virtual Production Lab', cat: 'film-media', tag: 'VirtualProduction', fmt: 'in-person' },
        { title: 'Indie Game Developers Showcase & Pitch', cat: 'gaming-esports', tag: 'IndieDev', fmt: 'hybrid' },
        { title: 'Founders Under 30 Breakfast Mixer', cat: 'community-networking', tag: 'Founders', fmt: 'in-person' },
        { title: 'Autonomous Robotics in Warehouses Expo', cat: 'technology-ai', tag: 'Robotics', fmt: 'in-person' },
        { title: 'London Craft Beer & Cider Fiesta', cat: 'food-culinary', tag: 'CraftBeer', fmt: 'in-person' },
        { title: 'Acoustic Guitar Showcase & Jam', cat: 'music-festivals', tag: 'Guitar', fmt: 'in-person' },
        { title: 'Women in Venture Capital Leadership Brunch', cat: 'business-startups', tag: 'Venture', fmt: 'in-person' },
        { title: 'Typography & Motion Poster Workshop', cat: 'design-creative', tag: 'Typography', fmt: 'online' },
        { title: 'Deep Ocean Exploration & Marine Biology Forum', cat: 'science-aerospace', tag: 'Ocean', fmt: 'hybrid' },
        { title: 'SaaS Metrics & Net Revenue Retention Summit', cat: 'business-startups', tag: 'SaaS', fmt: 'online' },
        { title: 'Cold Plunge & Cryo Recovery Expo', cat: 'health-wellness', tag: 'Cryo', fmt: 'in-person' },
        { title: 'DocuFilm Pitching Market & Distribution', cat: 'film-media', tag: 'Docu', fmt: 'in-person' },
        { title: 'Retro Arcade & Speedrunning Championship', cat: 'gaming-esports', tag: 'Retro', fmt: 'in-person' },
        { title: 'Urban Gardening & Micro-Greens Workshop', cat: 'community-networking', tag: 'Gardening', fmt: 'in-person' },
        { title: 'Rust Systems Programming Conference', cat: 'technology-ai', tag: 'Rust', fmt: 'hybrid' },
        { title: 'Jazz After Dark: Sunset Rooftop Jam', cat: 'music-festivals', tag: 'Jazz', fmt: 'in-person' },
        { title: 'Seed to Series A Fundraising Playbook', cat: 'business-startups', tag: 'Funding', fmt: 'online' },
        { title: 'Coffee Cupping & Specialty Roasters Fair', cat: 'food-culinary', tag: 'Coffee', fmt: 'in-person' },
        { title: 'Post-Traumatic Growth & Resilience Panel', cat: 'health-wellness', tag: 'MentalHealth', fmt: 'hybrid' },
        { title: 'Brand Identity Redesigns Under the Microscope', cat: 'design-creative', tag: 'Branding', fmt: 'in-person' },
        { title: 'Dark Matter & Particle Physics Symposium', cat: 'science-aerospace', tag: 'Physics', fmt: 'in-person' },
        { title: 'Color Grading Masterclass with DaVinci Resolve', cat: 'film-media', tag: 'ColorGrading', fmt: 'online' },
        { title: 'Fighting Game Community Regional Tournament', cat: 'gaming-esports', tag: 'FGC', fmt: 'in-person' },
        { title: 'Community Hacknight for Open Source Social Good', cat: 'community-networking', tag: 'OpenSource', fmt: 'in-person' },
        { title: 'NextGen LLM Infrastructure & Tensor Caches', cat: 'technology-ai', tag: 'LLM', fmt: 'hybrid' },
        { title: 'Indie Folk Under the Redwoods Acoustic Tour', cat: 'music-festivals', tag: 'Folk', fmt: 'in-person' },
        { title: 'Product-Led Growth (PLG) Conference 2026', cat: 'business-startups', tag: 'PLG', fmt: 'in-person' },
        { title: 'Artisan Cheese & Charcuterie Pairing Salon', cat: 'food-culinary', tag: 'Cheese', fmt: 'in-person' },
        { title: 'Vagus Nerve Reset & Breath Alignment Clinic', cat: 'health-wellness', tag: 'Wellness', fmt: 'in-person' },
        { title: '3D Spatial Modeling with Spline & Blender', cat: 'design-creative', tag: '3D', fmt: 'online' },
        { title: 'Fusion Energy Commercialization Roadmap', cat: 'science-aerospace', tag: 'Fusion', fmt: 'in-person' },
        { title: 'Stop Motion Animation Showcase & Demo', cat: 'film-media', tag: 'Animation', fmt: 'in-person' },
        { title: 'Cybersecurity Threat Hunting & Red Teaming', cat: 'technology-ai', tag: 'Security', fmt: 'hybrid' },
        { title: 'Underground Vinyl Record Fair & Selector Sets', cat: 'music-festivals', tag: 'Vinyl', fmt: 'in-person' },
        { title: 'B2B Enterprise Sales Accelerator Bootcamp', cat: 'business-startups', tag: 'Sales', fmt: 'online' },
        { title: 'Molecular Mixology & Craft Botanical Cocktails', cat: 'food-culinary', tag: 'Cocktails', fmt: 'in-person' },
        { title: 'Strength Architecture: Olympic Lifting Mechanics', cat: 'health-wellness', tag: 'Fitness', fmt: 'in-person' },
        { title: 'Design Systems at Scale: Multi-Platform Sync', cat: 'design-creative', tag: 'DesignSystems', fmt: 'hybrid' },
        { title: 'Solar Flare Prediction & Magnetosphere Research', cat: 'science-aerospace', tag: 'Solar', fmt: 'online' },
        { title: 'Audio Post-Production & Foley Sound Effects', cat: 'film-media', tag: 'Audio', fmt: 'in-person' },
        { title: 'Speed Dating for Tech Co-Founders', cat: 'community-networking', tag: 'CoFounders', fmt: 'in-person' },
        { title: 'Micro-Frontend Architectures in Production', cat: 'technology-ai', tag: 'Frontend', fmt: 'online' },
        { title: 'Synthwave Neon Night Drive Showcase', cat: 'music-festivals', tag: 'Synthwave', fmt: 'in-person' },
        { title: 'Climate Tech Venture Forum & Green Hydrogen', cat: 'business-startups', tag: 'Climate', fmt: 'hybrid' },
        { title: 'Pastry Arts & Parisian Macaron Masterclass', cat: 'food-culinary', tag: 'Pastry', fmt: 'in-person' },
    ];
    const fullEventsList = [
        ...eventTemplates,
        ...additionalEventTitles.map((item, idx) => ({
            title: item.title,
            categorySlug: item.cat,
            format: item.fmt,
            shortDescription: `A high-caliber professional gathering focusing on ${item.tag} and community learning.`,
            description: `Experience keynote presentations, case study deep-dives, lightning sessions, and high-impact peer networking. Dedicated to advancing practices and building lifelong connections in ${item.title}.`,
            coverImage: categoriesData.find((c) => c.slug === item.cat)?.coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
            daysFromNow: (idx % 2 === 0 ? 1 : -1) * ((idx * 2) % 45 + 3),
            durationHours: 8 + (idx % 16),
            capacity: 150 + ((idx * 37) % 800),
            venueIndex: idx % createdVenues.length,
            featured: idx % 10 === 0,
            status: ((idx * 2) % 45 + 3) < 0 ? 'completed' : 'published',
            tags: [item.tag, 'Planora2026', 'Community'],
        })),
    ];
    const createdEvents = [];
    const createdTicketTypes = [];
    for (let i = 0; i < fullEventsList.length; i++) {
        const item = fullEventsList[i];
        const categoryDoc = createdCategories.find((c) => c.slug === item.categorySlug) || createdCategories[0];
        const venueDoc = item.format === 'online' ? null : createdVenues[item.venueIndex % createdVenues.length];
        const organizerDoc = allOrganizers[i % allOrganizers.length] || primaryOrganizer;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + item.daysFromNow);
        startDate.setHours(9 + (i % 4), 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + item.durationHours);
        const slug = `${item.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}-${1000 + i}`;
        const sessions = [
            {
                title: 'Keynote & Strategic Vision',
                description: 'Opening keynote setting the thematic agenda for this edition.',
                track: 'Main Auditorium',
                startTime: new Date(startDate.getTime() + 1000 * 60 * 60),
                endTime: new Date(startDate.getTime() + 1000 * 60 * 120),
                speakerNames: ['Dr. Sarah Jenkins', 'Alex Rivera'],
                location: venueDoc ? 'Hall A' : 'Stream Track 1',
            },
            {
                title: 'Deep Dive Technical Panel & Case Studies',
                description: 'Breakout sessions covering real-world implementations, trade-offs, and live benchmarks.',
                track: 'Deep Dives',
                startTime: new Date(startDate.getTime() + 1000 * 60 * 150),
                endTime: new Date(startDate.getTime() + 1000 * 60 * 240),
                speakerNames: ['Marcus Vance', 'Priya Patel'],
                location: venueDoc ? 'Room 204' : 'Stream Track 2',
            },
        ];
        const speakers = [
            {
                name: 'Dr. Sarah Jenkins',
                role: 'Chief Scientist',
                company: 'Synthetica AI',
                bio: 'Pioneering researcher in high-dimensional neural architectures and cognitive agents.',
                photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
                socialLinks: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' },
            },
            {
                name: 'Alex Rivera',
                role: 'VP of Product',
                company: 'Vanguard Systems',
                bio: 'Designing user experiences for complex systems and next-generation interfaces.',
                photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                socialLinks: { twitter: 'https://twitter.com', website: 'https://alexrivera.dev' },
            },
        ];
        const sponsors = [
            { name: 'Vanguard Cloud', tier: 'Platinum', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Vanguard' },
            { name: 'Apex Capital', tier: 'Gold', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Apex' },
            { name: 'Planora Labs', tier: 'Silver', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Planora' },
        ];
        const event = await models_1.Event.create({
            title: item.title,
            slug,
            shortDescription: item.shortDescription,
            description: item.description,
            categoryId: categoryDoc._id,
            organizerId: organizerDoc._id,
            venueId: venueDoc ? venueDoc._id : null,
            format: item.format,
            onlineUrl: item.format !== 'in-person' ? 'https://meet.planora.dev/live-stage' : '',
            coverImage: item.coverImage,
            galleryImages: item.galleryImages || [],
            startDate,
            endDate,
            timezone: 'America/New_York',
            capacity: item.capacity,
            remainingCapacity: Math.max(10, Math.floor(item.capacity * 0.45)),
            visibility: 'public',
            status: item.status,
            tags: item.tags,
            featured: item.featured,
            cancellationReason: item.cancellationReason || '',
            sessions,
            speakers,
            sponsors,
            averageRating: 4.8,
            reviewsCount: 0,
            isDeleted: false,
        });
        createdEvents.push(event);
        // Create 3 ticket tiers per event: Early Bird, General Admission, VIP Pass
        const isFreeEvent = i % 5 === 0;
        const basePrice = isFreeEvent ? 0 : 49 + (i % 4) * 50;
        const t1 = await models_1.TicketType.create({
            eventId: event._id,
            name: isFreeEvent ? 'Free General Admission' : 'Early Bird Pass',
            description: isFreeEvent ? 'Full event pass with community access' : 'Discounted tier for early registrants',
            price: isFreeEvent ? 0 : Math.round(basePrice * 0.75),
            totalQuantity: Math.floor(item.capacity * 0.3),
            remainingQuantity: Math.floor(item.capacity * 0.1),
            perUserLimit: 4,
            salesStart: new Date(startDate.getTime() - 1000 * 60 * 60 * 24 * 30),
            salesEnd: new Date(startDate.getTime() - 1000 * 60 * 60 * 24 * 7),
            status: 'active',
        });
        const t2 = await models_1.TicketType.create({
            eventId: event._id,
            name: isFreeEvent ? 'Supporter Tier (Free)' : 'General Admission',
            description: 'Standard access to all conference stages and exhibitions',
            price: isFreeEvent ? 0 : basePrice,
            totalQuantity: Math.floor(item.capacity * 0.5),
            remainingQuantity: Math.floor(item.capacity * 0.25),
            perUserLimit: 5,
            salesStart: new Date(startDate.getTime() - 1000 * 60 * 60 * 24 * 30),
            salesEnd: startDate,
            status: 'active',
        });
        const t3 = await models_1.TicketType.create({
            eventId: event._id,
            name: 'VIP All-Access & Lounge Pass',
            description: 'VIP priority seating, speaker lounge access, and opening gala dinner ticket',
            price: isFreeEvent ? 0 : basePrice * 2.2,
            totalQuantity: Math.floor(item.capacity * 0.2),
            remainingQuantity: Math.floor(item.capacity * 0.08),
            perUserLimit: 2,
            salesStart: new Date(startDate.getTime() - 1000 * 60 * 60 * 24 * 30),
            salesEnd: startDate,
            status: 'active',
        });
        createdTicketTypes.push(t1, t2, t3);
    }
    console.log(`✅ Created ${createdEvents.length} events and ${createdTicketTypes.length} ticket tiers.`);
    // Update Category event counts
    for (const cat of createdCategories) {
        const count = await models_1.Event.countDocuments({ categoryId: cat._id, isDeleted: false });
        cat.eventCount = count;
        await cat.save();
    }
    // 7. Seed 320+ Bookings with QR codes, check-ins, and realistic pricing
    console.log('💳 Seeding 320+ realistic bookings with QR codes and check-in records...');
    const bookingsToCreate = [];
    for (let i = 0; i < 320; i++) {
        const event = createdEvents[i % createdEvents.length];
        const ticketTypesForEvent = createdTicketTypes.filter((t) => t.eventId.toString() === event._id.toString());
        const ticketType = ticketTypesForEvent[i % ticketTypesForEvent.length];
        const user = allAttendees[i % allAttendees.length];
        const quantity = (i % 3) + 1;
        const unitPrice = ticketType.price;
        const subtotal = unitPrice * quantity;
        const discountAmount = i % 7 === 0 ? Math.min(20, subtotal * 0.2) : 0;
        const totalAmount = Math.max(0, subtotal - discountAmount);
        const bookingRef = `PLN-${2026}-${crypto_1.default.randomBytes(3).toString('hex').toUpperCase()}`;
        const qrPayload = JSON.stringify({
            ref: bookingRef,
            eventId: event._id.toString(),
            eventTitle: event.title,
            userId: user._id.toString(),
            attendee: user.name,
            quantity,
            ticketType: ticketType.name,
            date: event.startDate.toISOString(),
        });
        const qrCodeData = await qrcode_1.default.toDataURL(qrPayload, {
            color: { dark: '#1A1A2E', light: '#FBF7EE' },
            width: 256,
            margin: 1,
        });
        const isPast = new Date(event.startDate) < new Date();
        const isCancelled = event.status === 'cancelled';
        const status = isCancelled ? 'cancelled' : 'confirmed';
        // Past events have higher check-in rate
        const isCheckedIn = !isCancelled && isPast ? (i % 5 !== 0) : (!isCancelled && i % 3 === 0);
        const bookingDate = new Date(event.startDate.getTime() - (10 + (i % 15)) * 24 * 60 * 60 * 1000);
        bookingsToCreate.push({
            bookingReference: bookingRef,
            eventId: event._id,
            userId: user._id,
            ticketTypeId: ticketType._id,
            quantity,
            unitPrice,
            subtotal,
            discountAmount,
            totalAmount,
            status,
            paymentStatus: totalAmount === 0 ? 'free' : 'paid',
            paymentMethod: totalAmount === 0 ? 'free' : 'demo_card',
            paymentReference: totalAmount === 0 ? 'FREE_PASS' : `DEMO_PAY_${crypto_1.default.randomBytes(5).toString('hex').toUpperCase()}`,
            attendeeDetails: Array.from({ length: quantity }, (_, aIdx) => ({
                name: aIdx === 0 ? user.name : `Guest of ${user.name}`,
                email: aIdx === 0 ? user.email : `guest${aIdx}.${user.email}`,
            })),
            qrCodeData,
            checkInStatus: isCheckedIn ? 'checked_in' : 'not_checked_in',
            checkedInAt: isCheckedIn ? new Date(event.startDate.getTime() + 1000 * 60 * 30) : undefined,
            checkedInBy: isCheckedIn ? primaryOrganizer._id : undefined,
            cancellationReason: isCancelled ? 'Event cancelled by organizer' : '',
            waitlisted: false,
            createdAt: bookingDate,
            updatedAt: bookingDate,
        });
    }
    const createdBookings = await models_1.Booking.insertMany(bookingsToCreate);
    console.log(`✅ Created ${createdBookings.length} bookings.`);
    // 8. Seed 100+ Reviews with ratings and organizer responses
    console.log('⭐ Seeding 100+ authentic reviews and organizer replies...');
    const reviewTitles = [
        'Breathtaking production quality and insights!',
        'The best summit I attended all year.',
        'Flawless organization, vibrant crowd, and top speakers.',
        'Exceeded all my expectations!',
        'Incredible venue acoustics and smooth check-in.',
        'Deep technical rigor and fantastic networking.',
        'Truly unforgettable keynote sessions.',
        'Well paced, delicious catering, and friendly organizers.',
    ];
    const reviewComments = [
        'The caliber of the speakers and discussions was second to none. Check-in was instantaneous with the QR code and the staff were exceptionally welcoming.',
        'From the opening keynote to the evening mixer, everything ran seamlessly like clockwork. Can not wait for the next edition!',
        'The venue was phenomenal and the audio was crystal clear throughout. I met multiple future collaborators in the lounge track.',
        'Superb experience from booking to attending. The mobile ticket and calendar sync worked like a charm.',
        'Highly recommended for anyone looking to stay ahead in the industry. The panels were rich with actionable takeaways.',
    ];
    const reviewsToCreate = [];
    const completedEvents = createdEvents.filter((e) => e.status === 'completed' || new Date(e.startDate) < new Date());
    for (let i = 0; i < Math.min(completedEvents.length, 30); i++) {
        const event = completedEvents[i];
        const eventBookings = createdBookings.filter((b) => b.eventId.toString() === event._id.toString());
        for (let j = 0; j < Math.min(eventBookings.length, 4); j++) {
            const b = eventBookings[j];
            const rating = 4 + (j % 2); // 4 or 5 stars
            reviewsToCreate.push({
                eventId: event._id,
                userId: b.userId,
                bookingId: b._id,
                rating,
                title: reviewTitles[(i + j) % reviewTitles.length],
                comment: reviewComments[(i + j) % reviewComments.length],
                organizerReply: j === 0
                    ? {
                        comment: 'Thank you so much for being an integral part of this edition! We look forward to seeing you at our next event.',
                        repliedAt: new Date(),
                        repliedBy: primaryOrganizer._id,
                    }
                    : undefined,
                isApproved: true,
            });
        }
    }
    await models_1.Review.insertMany(reviewsToCreate);
    console.log(`✅ Created ${reviewsToCreate.length} reviews.`);
    // Recalculate event ratings
    for (const event of completedEvents) {
        const revs = await models_1.Review.find({ eventId: event._id });
        if (revs.length > 0) {
            const sum = revs.reduce((acc, r) => acc + r.rating, 0);
            event.averageRating = Number((sum / revs.length).toFixed(1));
            event.reviewsCount = revs.length;
            await event.save();
        }
    }
    // 9. Seed Favorites
    console.log('❤️ Seeding attendee favorites/wishlist...');
    const favoritesToCreate = [];
    for (let i = 0; i < allAttendees.length; i++) {
        const user = allAttendees[i];
        for (let j = 0; j < 3; j++) {
            const ev = createdEvents[(i * 3 + j) % createdEvents.length];
            favoritesToCreate.push({
                userId: user._id,
                eventId: ev._id,
            });
        }
    }
    await models_1.Favorite.insertMany(favoritesToCreate);
    // 10. Seed Notifications
    console.log('🔔 Seeding in-app notifications...');
    const notificationsToCreate = [
        {
            userId: primaryOrganizer._id,
            title: 'Ticket Sales Milestone Reached',
            message: 'Global AI Summit has surpassed 80% ticket sales capacity!',
            type: 'system',
            link: '/organizer/dashboard',
        },
        {
            userId: primaryOrganizer._id,
            title: 'New 5-Star Review Received',
            message: 'Aria Chen left a glowing 5-star review on your recent conclave.',
            type: 'system',
            link: '/organizer/dashboard',
        },
        {
            userId: allAttendees[0]._id,
            title: 'Your Pass for Global AI Summit is Confirmed',
            message: 'Ready to attend? Your QR code ticket is stored in My Tickets.',
            type: 'booking_confirmed',
            link: '/my-tickets',
        },
        {
            userId: allAttendees[0]._id,
            title: 'Reminder: Summit starts in 2 weeks',
            message: 'Check out the published sessions and add them to your calendar.',
            type: 'reminder',
            link: `/events/${createdEvents[0].slug}`,
        },
    ];
    await models_1.Notification.insertMany(notificationsToCreate);
    // 11. Seed Audit Logs
    console.log('📜 Seeding audit logs...');
    const auditLogsData = [
        {
            userId: adminUser._id,
            userEmail: adminUser.email,
            action: 'PLATFORM_INITIALIZATION',
            entityType: 'System',
            details: { environment: 'development', mode: 'seeded' },
        },
        {
            userId: primaryOrganizer._id,
            userEmail: primaryOrganizer.email,
            action: 'EVENT_PUBLISHED',
            entityType: 'Event',
            entityId: createdEvents[0]._id.toString(),
            details: { title: createdEvents[0].title },
        },
        {
            userId: adminUser._id,
            userEmail: adminUser.email,
            action: 'CATEGORY_CREATED',
            entityType: 'Category',
            details: { categoryCount: createdCategories.length },
        },
    ];
    await models_1.AuditLog.insertMany(auditLogsData);
    console.log('\n🎉 ========================================================');
    console.log('✨ PLANORA DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`📊 Total Users: ${createdUsers.length}`);
    console.log(`📊 Total Events: ${createdEvents.length}`);
    console.log(`📊 Total Categories: ${createdCategories.length}`);
    console.log(`📊 Total Venues: ${createdVenues.length}`);
    console.log(`📊 Total Ticket Types: ${createdTicketTypes.length}`);
    console.log(`📊 Total Bookings: ${createdBookings.length}`);
    console.log(`📊 Total Reviews: ${reviewsToCreate.length}`);
    console.log('========================================================\n');
    console.log('🔑 DEMO ACCOUNTS READY TO USE:');
    console.log('  👑 Admin:     admin@planora.dev     | Password: Admin123!');
    console.log('  🎯 Organizer: organizer@planora.dev | Password: Organizer123!');
    console.log('  🎟️ Attendee:  attendee@planora.dev  | Password: Attendee123!');
    console.log('========================================================\n');
    await (0, db_1.disconnectDB)();
};
exports.seedDatabase = seedDatabase;
if (require.main === module) {
    (0, exports.seedDatabase)()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error('Seeding failed with error:', err);
        process.exit(1);
    });
}
