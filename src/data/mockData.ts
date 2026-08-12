import { 
  Listing, 
  SdaChurch, 
  UserProfile, 
  StayRequest, 
  Message, 
  Review, 
  VerificationRequest, 
  AuditLog,
  FamilyProfile,
  FamilyExchangeRequest,
  FamilyExchangeReview
} from '../types';
import { additionalListings } from './additionalListings';
import { additionalFamilyProfiles } from './additionalFamilyProfiles';

export const initialProfiles: UserProfile[] = [
  {
    id: 'user-guest-1',
    name: 'David & Sarah Miller',
    email: 'guest@test.local',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: 'GUEST',
    guestCategory: 'ADVENTIST_GUEST',
    verificationTier: 'ADMIN_VERIFIED',
    familyVerificationLevel: 3,
    homeChurchName: 'Pioneer Memorial Church',
    homeChurchCity: 'Berrien Springs, MI',
    conferenceName: 'Michigan Conference',
    pastorName: 'Pr. Dwight Nelson',
    membershipYear: 2012,
    bio: 'Avid mission travelers and educators. We enjoy fellowship, sabbath meals, and visiting SDA historical sites worldwide.',
    phone: '+1 (269) 555-0192',
    languagePreference: 'en',
    accountStatus: 'ACTIVE'
  },
  {
    id: 'user-guest-explorer',
    name: 'Jonathan Vance (Explorer)',
    email: 'jonathan.explorer@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    role: 'GUEST',
    guestCategory: 'SABBATH_EXPLORER',
    verificationTier: 'MEMBER_SUBMITTED',
    familyVerificationLevel: 2,
    homeChurchName: 'Exploring Sabbath Fellowship',
    homeChurchCity: 'Pasadena, CA',
    conferenceName: 'Community Visitor',
    pastorName: 'N/A (Sabbath Explorer)',
    membershipYear: 2026,
    bio: 'Interested in learning about the Seventh-day Adventist Sabbath, health principles, and experiencing Christian family fellowship.',
    phone: '+1 (626) 555-0133',
    languagePreference: 'en',
    accountStatus: 'ACTIVE'
  },
  {
    id: 'user-host-1',
    name: 'Elder Marcus & Ellen Vance',
    email: 'host@test.local',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    role: 'HOST',
    verificationTier: 'ADMIN_VERIFIED',
    familyVerificationLevel: 4,
    homeChurchName: 'Loma Linda University Church',
    homeChurchCity: 'Loma Linda, CA',
    conferenceName: 'Southeastern California Conference',
    pastorName: 'Pr. Randy Roberts',
    membershipYear: 1998,
    bio: 'Retired SDA health professionals opening our home to Sabbath keepers, medical residents, and mission workers.',
    phone: '+1 (909) 555-0144',
    languagePreference: 'en',
    accountStatus: 'ACTIVE',
    isHostApproved: true
  },
  {
    id: 'user-admin-1',
    name: 'Sister Rachel Santos',
    email: 'admin@test.local',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    role: 'ADMIN',
    verificationTier: 'ADMIN_VERIFIED',
    familyVerificationLevel: 4,
    homeChurchName: 'General Conference Headquarters Church',
    homeChurchCity: 'Silver Spring, MD',
    conferenceName: 'North American Division',
    pastorName: 'Pr. Ted Wilson',
    membershipYear: 2001,
    bio: 'Platform Administrator managing verification standards, safety audits, host approvals, and global membership.',
    phone: '+1 (301) 555-0100',
    languagePreference: 'en',
    accountStatus: 'ACTIVE'
  }
];

export const initialListings: Listing[] = [
  {
    id: 'list-1',
    hostId: 'user-host-1',
    hostName: 'Marcus & Ellen Vance',
    familyName: 'The Vance Family',
    familyStory: 'We have been active members of the Loma Linda community for over 25 years. Elder Marcus served in healthcare administration and Ellen teaches health ministry. We love gathering around the Friday sunset vespers table, sharing plant-based meals, singing hymns, and welcoming brethren from all corners of the globe.',
    spouseInfo: 'Marcus (Healthcare Admin) & Ellen (Health Ministry Educator)',
    childrenInfo: '2 grown adult children who also attend Loma Linda Church',
    familyInterests: ['Plant-Based Cooking', 'Hydrotherapy', 'Nature Walks', 'Hymn Singing', 'Mission Stories'],
    sabbathActivities: ['Friday Sunset Vespers & Family Dinner', 'Sabbath School & Divine Service', 'Fellowship Potluck Lunch', 'Sabbath Afternoon Nature Walk in Redlands'],
    languagesSpoken: ['English', 'Spanish'],
    hostingPreferences: 'Prefer Friday arrival to Saturday evening or Sunday departure. 1 Sabbath weekend fellowship.',
    verificationLevel: 4,
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    hostChurchName: 'Loma Linda University Church',
    hostVerificationTier: 'CONFERENCE_VERIFIED',
    title: 'The Vance Family',
    description: 'Experience genuine Sabbath family hospitality with the Vance family! Our peaceful home features a clean private suite, Friday evening family dinner, ride to Loma Linda University Church, and wholesome Sabbath lunch fellowship.',
    propertyType: 'Family Home Stay',
    city: 'Loma Linda',
    stateProvince: 'California',
    country: 'United States',
    coordinates: { lat: 34.0483, lng: -117.2612 },
    nearestSdaChurch: {
      name: 'Loma Linda University Church',
      distanceMiles: 0.6,
      address: '11125 Campus St, Loma Linda, CA 92354'
    },
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    familyPhotos: [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506869640319-fe1a24c46dd4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Private Guest Suite', 'High-Speed Wi-Fi', 'Plant-Based Kitchen Access', 'Laundry Facility', 'Air Conditioning', 'Off-Street Parking'],
    experienceTypes: ['SABBATH_FAMILY_EXPERIENCE', 'CHURCH_VISIT_EXPERIENCE', 'ADVENTIST_LIFESTYLE_EXPERIENCE'],
    hospitalityPerks: {
      fridayDinner: true,
      sabbathChurchRide: true,
      sabbathLunch: true,
      sunsetVespers: true,
      airportPickup: true
    },
    sabbathFeatures: {
      vegetarianMealsProvided: true,
      sunsetSabbathFellowship: true,
      churchRideAvailable: true,
      plantBasedKitchen: true,
      quietEnvironment: true
    },
    houseRules: [
      'No alcohol, tobacco, or substance use on premises',
      'Wholesome plant-based meals shared at table',
      'Peaceful Sabbath sacred atmosphere (Friday sunset to Saturday sunset)',
      'Modest standards of Christian family decorum'
    ],
    stayPurposesSupported: ['MEDICAL_CARE', 'EDUCATION_STUDY', 'WORSHIP_VISIT', 'CONFERENCE_EVENT'],
    rating: 4.98,
    reviewCount: 28,
    featured: true,
    categories: ['City', 'Family', 'Modern'],
    responseRate: 100,
    acceptanceRate: 95,
    responseTime: 'Within 1 hour',
    lastActive: 'Active today',
    minStayNights: 2,
    maxStayNights: 14,
    exchangeType: 'Non-Commercial Christian Fellowship & Homestay Exchange',
    whatGuestsGain: [
      'Plant-Based Cooking & Hydrotherapy Workshops',
      'Friday Sunset Vespers & Hymn Singing Fellowship',
      'Complimentary Sabbath Church Ride to Loma Linda Church',
      'Home-cooked Organic Sabbath Breakfast & Lunch'
    ],
    householdContribution: 'We invite guests to join our Friday evening family prayer ring, share a story or hymn, and help clear the table after Sabbath lunch fellowship.',
    dietaryStyle: '100% Total Plant-Based Kitchen (Whole Food Vegan & Vegetarian)',
    livingArrangements: 'Private Guest Suite with Orthopedic Queen Bed, en-suite bathroom, and garden view balcony.',
    internetSpeed: 'Verified Ultra-Fast Fiber Wi-Fi (300+ Mbps)',
    petsOnProperty: '1 gentle Golden Retriever (stays outdoors in garden area)',
    gettingHereDirections: 'We offer complimentary pickup from Ontario International Airport (ONT) or San Bernardino Metrolink Station upon request!',
    nearbyAttractions: ['Loma Linda University Health Heritage Center', 'Redlands Hills Hiking Trail', 'San Gorgonio Wilderness Nature Reserve', 'Historic Loma Linda Campus']
  },
  {
    id: 'list-2',
    hostId: 'host-2',
    hostName: 'Dr. Arthur & Hannah Brooks',
    familyName: 'The Brooks Family',
    familyStory: 'Our family lives near Andrews University in Berrien Springs. Arthur teaches at the seminary and Hannah directs the youth choir. We love opening our home to visiting students, pastors, Pathfinders, and guests exploring Adventist university life.',
    spouseInfo: 'Arthur (Seminary Faculty) & Hannah (Music & Youth Director)',
    childrenInfo: '3 children (ages 10, 14, 17)',
    familyInterests: ['Youth Ministry', 'Choral Music', 'Gardening', 'Sabbath Walk', 'Christian Literature'],
    sabbathActivities: ['Pioneer Memorial Church Service', 'Potluck with Seminary Students', 'Afternoon Campus Stroll', 'Sunset Prayer Ring'],
    languagesSpoken: ['English', 'German'],
    hostingPreferences: 'Weekend Sabbath stay preferred (Friday to Sunday).',
    verificationLevel: 4,
    hostAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    hostChurchName: 'Pioneer Memorial Church',
    hostVerificationTier: 'ADMIN_VERIFIED',
    title: 'The Brooks Family',
    description: 'Welcome to the Brooks family home! Situated a short walk from Pioneer Memorial Church, we offer warm Adventist family fellowship, homemade Sabbath meals, and guidance around the historic Andrews University campus.',
    propertyType: 'Family Home Stay',
    city: 'Berrien Springs',
    stateProvince: 'Michigan',
    country: 'United States',
    coordinates: { lat: 41.9461, lng: -86.3389 },
    nearestSdaChurch: {
      name: 'Pioneer Memorial Church',
      distanceMiles: 0.4,
      address: '8655 University Blvd, Berrien Springs, MI 49103'
    },
    maxGuests: 3,
    bedrooms: 1,
    bathrooms: 1,
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80'
    ],
    familyPhotos: [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506869640319-fe1a24c46dd4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Private Bedroom', 'Wi-Fi', 'Study Desk', 'Backyard Garden', 'Breakfast Included'],
    experienceTypes: ['SABBATH_FAMILY_EXPERIENCE', 'CHURCH_VISIT_EXPERIENCE', 'MISSION_FELLOWSHIP_EXPERIENCE'],
    hospitalityPerks: {
      fridayDinner: true,
      sabbathChurchRide: true,
      sabbathLunch: true,
      sunsetVespers: true,
      airportPickup: false
    },
    sabbathFeatures: {
      vegetarianMealsProvided: true,
      sunsetSabbathFellowship: true,
      churchRideAvailable: true,
      plantBasedKitchen: true,
      quietEnvironment: true
    },
    houseRules: [
      'Christian family decorum',
      'Plant-based food kitchen',
      'Peaceful Sabbath observance'
    ],
    stayPurposesSupported: ['EDUCATION_STUDY', 'MISSION_WORK', 'CAMP_CAMP_MEETING', 'WORSHIP_VISIT'],
    rating: 4.95,
    reviewCount: 42,
    featured: true,
    categories: ['Village', 'Family', 'Quiet'],
    responseRate: 98,
    acceptanceRate: 88,
    responseTime: 'Within 2 hours',
    minStayNights: 1,
  },
  {
    id: 'list-3',
    hostId: 'host-3',
    hostName: 'Pr. Emmanuel & Grace Ndirangu',
    familyName: 'The Ndirangu Family',
    familyStory: 'Greeting from Bracknell, UK! Emmanuel serves as pastor and Grace coordinates community health expos. We love hosting international brethren, missionaries, and visitors attending Newbold College.',
    spouseInfo: 'Pr. Emmanuel (Pastor) & Grace (Community Health Coordinator)',
    childrenInfo: '2 university student children',
    familyInterests: ['Global Evangelism', 'Health Expos', 'British SDA History', 'Fellowship Dinners'],
    sabbathActivities: ['Friday Night Candlelight Worship', 'Newbold College Divine Service', 'Fellowship Lunch', 'Sabbath Afternoon Walk at Windsor Great Park'],
    languagesSpoken: ['English', 'Swahili'],
    hostingPreferences: 'Sabbath weekend stays & mission visitors.',
    verificationLevel: 4,
    hostAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    hostChurchName: 'Newbold College SDA Church',
    hostVerificationTier: 'CONFERENCE_VERIFIED',
    title: 'The Ndirangu Family',
    description: 'Join the Ndirangu family for a uplifting Sabbath in Berkshire! Located near Newbold College of Higher Education, we provide a private guest bedroom, Friday night fellowship dinner, and transportation to church.',
    propertyType: 'Family Home Stay',
    city: 'Bracknell',
    stateProvince: 'Berkshire',
    country: 'United Kingdom',
    coordinates: { lat: 51.4158, lng: -0.7523 },
    nearestSdaChurch: {
      name: 'Newbold College SDA Church',
      distanceMiles: 0.8,
      address: 'St Marks Rd, Binfield, Bracknell RG42 4AN'
    },
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    familyPhotos: [
      'https://images.unsplash.com/photo-1506869640319-fe1a24c46dd4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Ensuite Bathroom', 'Wi-Fi', 'Central Heating', 'Transit Access'],
    experienceTypes: ['SABBATH_FAMILY_EXPERIENCE', 'CHURCH_VISIT_EXPERIENCE', 'MISSION_FELLOWSHIP_EXPERIENCE'],
    hospitalityPerks: {
      fridayDinner: true,
      sabbathChurchRide: true,
      sabbathLunch: true,
      sunsetVespers: true,
      airportPickup: true
    },
    sabbathFeatures: {
      vegetarianMealsProvided: true,
      sunsetSabbathFellowship: true,
      churchRideAvailable: true,
      plantBasedKitchen: true,
      quietEnvironment: true
    },
    houseRules: [
      'Vegetarian household',
      'Check-in before Friday sunset',
      'Peaceful atmosphere'
    ],
    stayPurposesSupported: ['MISSION_WORK', 'EDUCATION_STUDY', 'FAMILY_TOURISM', 'WORSHIP_VISIT'],
    rating: 5.0,
    reviewCount: 19,
    featured: true,
    categories: ['City', 'Culture', 'Family']
  },
  {
    id: 'list-4',
    hostId: 'host-4',
    hostName: 'Carlos & Maria Silva',
    familyName: 'The Silva Family',
    familyStory: 'Bem-vindos! Our family lives on the UNASP campus in São Paulo. We enjoy introducing guests to Brazilian Adventist hospitality, delicious fresh tropical fruits, and vibrant church singing.',
    spouseInfo: 'Carlos (ADRA Project Manager) & Maria (Nutritionist)',
    childrenInfo: '2 teenage daughters',
    familyInterests: ['ADRA Service', 'Plant-Based Nutrition', 'Music Ministry', 'Cultural Exchange'],
    sabbathActivities: ['Friday Sunset Song & Prayer', 'UNASP Campus Church Service', 'Sabbath Family Feast', 'Sunset Closing Vespers'],
    languagesSpoken: ['Portuguese', 'Spanish', 'English'],
    hostingPreferences: 'Full weekend Sabbath family experience.',
    verificationLevel: 4,
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    hostChurchName: 'UNASP Central Church',
    hostVerificationTier: 'ADMIN_VERIFIED',
    title: 'The Silva Family',
    description: 'Experience warm Brazilian Sabbath fellowship with Carlos and Maria Silva on the secure UNASP campus. Includes homemade Brazilian plant-based dishes, church attendance, and family activities.',
    propertyType: 'Family Home Stay',
    city: 'São Paulo',
    stateProvince: 'São Paulo State',
    country: 'Brazil',
    coordinates: { lat: -23.6511, lng: -46.7725 },
    nearestSdaChurch: {
      name: 'Igreja Adventista do UNASP-SP',
      distanceMiles: 0.3,
      address: 'Estrada de Itapecerica 5859, São Paulo'
    },
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    images: [
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    familyPhotos: [
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506869640319-fe1a24c46dd4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Campus Security', 'Washing Machine', 'Wi-Fi', 'Balcony View'],
    experienceTypes: ['SABBATH_FAMILY_EXPERIENCE', 'ADVENTIST_LIFESTYLE_EXPERIENCE', 'CHURCH_VISIT_EXPERIENCE'],
    hospitalityPerks: {
      fridayDinner: true,
      sabbathChurchRide: true,
      sabbathLunch: true,
      sunsetVespers: true,
      airportPickup: false
    },
    sabbathFeatures: {
      vegetarianMealsProvided: true,
      sunsetSabbathFellowship: true,
      churchRideAvailable: true,
      plantBasedKitchen: true,
      quietEnvironment: true
    },
    houseRules: [
      'No alcohol/tobacco',
      'Plant-based kitchen',
      'Respectful Sabbath rest'
    ],
    stayPurposesSupported: ['MISSION_WORK', 'CAMP_CAMP_MEETING', 'EDUCATION_STUDY', 'CONFERENCE_EVENT'],
    rating: 4.92,
    reviewCount: 31,
    categories: ['City', 'Culture', 'Modern']
  },
  {
    id: 'list-5',
    hostId: 'host-5',
    hostName: 'Samuel & Tabitha Omondi',
    familyName: 'The Omondi Family',
    familyStory: 'Karibu! The Omondi family welcomes visitors to Nairobi. Samuel serves in church publishing and Tabitha leads Pathfinder clubs. Our home is a hub of prayer, African Sabbath choir songs, and joyful hospitality.',
    spouseInfo: 'Samuel (Publishing Director) & Tabitha (Pathfinder Director)',
    childrenInfo: '3 children (ages 8, 12, 15)',
    familyInterests: ['Pathfinder Ministry', 'Swahili Choral Singing', 'Community Outreach', 'African Cooking'],
    sabbathActivities: ['Nairobi Central Church Service', 'Pathfinder Sabbath Program', 'Fellowship Meal', 'Sabbath Sunset Prayer'],
    languagesSpoken: ['English', 'Swahili'],
    hostingPreferences: 'Visitors, mission volunteers, and international brethren.',
    verificationLevel: 4,
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    hostChurchName: 'Nairobi Central SDA Church',
    hostVerificationTier: 'CONFERENCE_VERIFIED',
    title: 'The Omondi Family',
    description: 'Welcome to the Omondi family home near Nairobi Central Church and East-Central Africa Division HQ! Enjoy traditional hospitality, church rides, fresh vegetarian meals, and uplifting Christian fellowship.',
    propertyType: 'Family Home Stay',
    city: 'Nairobi',
    stateProvince: 'Nairobi County',
    country: 'Kenya',
    coordinates: { lat: -1.2921, lng: 36.8219 },
    nearestSdaChurch: {
      name: 'Nairobi Central Seventh-day Adventist Church',
      distanceMiles: 1.2,
      address: 'Jakaya Kikwete Rd, Nairobi'
    },
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    familyPhotos: [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506869640319-fe1a24c46dd4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Gated Security', 'Solar Power Backup', 'Wi-Fi', 'Fresh Organic Meals'],
    experienceTypes: ['SABBATH_FAMILY_EXPERIENCE', 'MISSION_FELLOWSHIP_EXPERIENCE', 'CHURCH_VISIT_EXPERIENCE'],
    hospitalityPerks: {
      fridayDinner: true,
      sabbathChurchRide: true,
      sabbathLunch: true,
      sunsetVespers: true,
      airportPickup: true
    },
    sabbathFeatures: {
      vegetarianMealsProvided: true,
      sunsetSabbathFellowship: true,
      churchRideAvailable: true,
      plantBasedKitchen: true,
      quietEnvironment: true
    },
    houseRules: [
      'Christian family decorum',
      'Vegetarian diet',
      'Peaceful Sabbath observance'
    ],
    stayPurposesSupported: ['MISSION_WORK', 'WORSHIP_VISIT', 'CONFERENCE_EVENT', 'FAMILY_TOURISM'],
    rating: 4.97,
    reviewCount: 15,
    categories: ['City', 'Family', 'Culture']
  },
  {
    id: 'list-6',
    hostId: 'host-6',
    hostName: 'Elder Timothy & Ruth Campbell',
    familyName: 'The Campbell Family',
    familyStory: 'G\'day! Our family lives in Wahroonga near Sydney Adventist Hospital (The San). Timothy is an elder at Wahroonga Church and Ruth is a registered nurse. We love hosting Sabbath visitors, healthcare workers, and families.',
    spouseInfo: 'Timothy (Church Elder) & Ruth (San Hospital Nurse)',
    childrenInfo: '2 adult children living nearby',
    familyInterests: ['Healthcare Ministry', 'Australian Native Plants', 'Bushwalking', 'Organ Music'],
    sabbathActivities: ['Wahroonga Church Divine Service', 'San Hospital Chapel Visit', 'Sabbath Bushwalk', 'Vespers Fellowship'],
    languagesSpoken: ['English'],
    hostingPreferences: 'Sabbath weekend hosting & healthcare visits.',
    verificationLevel: 4,
    hostAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    hostChurchName: 'Wahroonga SDA Church',
    hostVerificationTier: 'CONFERENCE_VERIFIED',
    title: 'The Campbell Family',
    description: 'Welcome to the Campbell family garden home! Located 5 minutes from Sydney Adventist Hospital, we offer peaceful guest accommodations, Sabbath meals, and a warm Christian home environment.',
    propertyType: 'Family Home Stay',
    city: 'Sydney',
    stateProvince: 'New South Wales',
    country: 'Australia',
    coordinates: { lat: -33.7142, lng: 151.1183 },
    nearestSdaChurch: {
      name: 'Wahroonga Seventh-day Adventist Church',
      distanceMiles: 0.5,
      address: '183 Fox Valley Rd, Wahroonga NSW 2076'
    },
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    familyPhotos: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506869640319-fe1a24c46dd4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Ensuite Bathroom', 'Veranda Garden', 'Wi-Fi', 'Tea Station'],
    experienceTypes: ['SABBATH_FAMILY_EXPERIENCE', 'CHURCH_VISIT_EXPERIENCE', 'ADVENTIST_LIFESTYLE_EXPERIENCE'],
    hospitalityPerks: {
      fridayDinner: true,
      sabbathChurchRide: true,
      sabbathLunch: true,
      sunsetVespers: true,
      airportPickup: false
    },
    sabbathFeatures: {
      vegetarianMealsProvided: true,
      sunsetSabbathFellowship: true,
      churchRideAvailable: true,
      plantBasedKitchen: true,
      quietEnvironment: true
    },
    houseRules: [
      'No smoking or alcohol on property',
      'Plant-based kitchen environment',
      'Quiet Sabbath rest'
    ],
    stayPurposesSupported: ['MEDICAL_CARE', 'WORSHIP_VISIT', 'CONFERENCE_EVENT', 'FAMILY_TOURISM'],
    rating: 4.99,
    reviewCount: 36,
    categories: ['Nature', 'Quiet', 'Family', 'City']
  },
  ...additionalListings
];

export const initialChurches: SdaChurch[] = [
  {
    id: 'ch-1',
    name: 'Loma Linda University Church',
    conference: 'Southeastern California Conference',
    union: 'Pacific Union Conference',
    division: 'North American Division',
    address: '11125 Campus St',
    city: 'Loma Linda',
    country: 'United States',
    postalCode: '92354',
    phone: '+1 (909) 558-4570',
    email: 'info@lluc.org',
    pastorName: 'Pr. Randy Roberts',
    serviceTimes: {
      sabbathSchool: '09:00 AM & 10:30 AM',
      divineService: '09:00 AM & 11:45 AM',
      vespers: '05:00 PM (Sabbath sunset)'
    },
    website: 'https://lluc.org',
    verifiedStatus: true,
    coordinates: { lat: 34.0483, lng: -117.2612 },
    activeHostsCount: 14
  },
  {
    id: 'ch-2',
    name: 'Pioneer Memorial Church',
    conference: 'Michigan Conference',
    union: 'Lake Union Conference',
    division: 'North American Division',
    address: '8655 University Blvd',
    city: 'Berrien Springs',
    country: 'United States',
    postalCode: '49103',
    phone: '+1 (269) 471-3133',
    email: 'pmc@andrews.edu',
    pastorName: 'Pr. Dwight Nelson',
    serviceTimes: {
      sabbathSchool: '09:30 AM',
      divineService: '11:45 AM',
      midweekPrayer: 'Wednesday 07:00 PM'
    },
    website: 'https://pmchurch.org',
    verifiedStatus: true,
    coordinates: { lat: 41.9461, lng: -86.3389 },
    activeHostsCount: 18
  },
  {
    id: 'ch-3',
    name: 'Takoma Park SDA Church',
    conference: 'Chesapeake Conference',
    union: 'Columbia Union Conference',
    division: 'North American Division',
    address: '6810 Eastern Ave NW',
    city: 'Washington',
    country: 'United States',
    postalCode: '20012',
    phone: '+1 (202) 829-4800',
    email: 'office@theparkchurch.org',
    pastorName: 'Pr. Thomas Wright',
    serviceTimes: {
      sabbathSchool: '09:30 AM',
      divineService: '11:00 AM'
    },
    verifiedStatus: true,
    coordinates: { lat: 38.9733, lng: -77.0219 },
    activeHostsCount: 9
  },
  {
    id: 'ch-4',
    name: 'Newbold College SDA Church',
    conference: 'South England Conference',
    union: 'British Union Conference',
    division: 'Trans-European Division',
    address: 'St Marks Rd, Binfield',
    city: 'Bracknell',
    country: 'United Kingdom',
    postalCode: 'RG42 4AN',
    phone: '+44 1344 407400',
    email: 'church@newbold.ac.uk',
    pastorName: 'Pr. Emmanuel Ndirangu',
    serviceTimes: {
      sabbathSchool: '10:00 AM',
      divineService: '11:15 AM'
    },
    verifiedStatus: true,
    coordinates: { lat: 51.4158, lng: -0.7523 },
    activeHostsCount: 7
  },
  {
    id: 'ch-5',
    name: 'Igreja Adventista do UNASP-SP',
    conference: 'Associação Paulistana',
    union: 'União Central Brasileira',
    division: 'South American Division',
    address: 'Estrada de Itapecerica 5859',
    city: 'São Paulo',
    country: 'Brazil',
    postalCode: '05858-001',
    phone: '+55 11 2128-6000',
    email: 'contato@unasp.br',
    pastorName: 'Pr. Edson Nunes',
    serviceTimes: {
      sabbathSchool: '09:00 AM',
      divineService: '10:30 AM',
      vespers: '06:00 PM'
    },
    verifiedStatus: true,
    coordinates: { lat: -23.6511, lng: -46.7725 },
    activeHostsCount: 12
  }
];

export const initialStayRequests: StayRequest[] = [
  {
    id: 'req-101',
    listingId: 'list-1',
    listingTitle: 'Peaceful Olive Tree Guest Suite near Loma Linda Medical Center',
    listingCity: 'Loma Linda, CA',
    listingImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    guestId: 'user-guest-1',
    guestName: 'David & Sarah Miller',
    guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    guestChurch: 'Pioneer Memorial Church',
    guestVerificationTier: 'ADMIN_VERIFIED',
    hostId: 'user-host-1',
    hostName: 'Elder Marcus & Ellen Vance',
    checkInDate: '2026-08-14',
    checkOutDate: '2026-08-17',
    guestCount: 2,
    purpose: 'MEDICAL_CARE',
    purposeNote: 'Visiting Loma Linda Childrens Hospital for medical consultation and attending Sabbath divine service.',
    status: 'APPROVED',
    createdAt: '2026-08-01T10:15:00Z',
    checkInInstructions: 'Check-in time is Friday between 3:00 PM and 6:00 PM. Gate code is #7721. We look forward to sharing Sabbath sunset vespers with you!'
  },
  {
    id: 'req-102',
    listingId: 'list-2',
    listingTitle: 'Andrews University Heritage Haven Cottage',
    listingCity: 'Berrien Springs, MI',
    listingImage: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    guestId: 'guest-sub-1',
    guestName: 'Brother Jonathan Kim',
    guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    guestChurch: 'Seoul Central SDA Church',
    guestVerificationTier: 'ADMIN_VERIFIED',
    hostId: 'host-2',
    hostName: 'Dr. Arthur & Hannah Brooks',
    checkInDate: '2026-08-20',
    checkOutDate: '2026-08-23',
    guestCount: 1,
    purpose: 'EDUCATION_STUDY',
    purposeNote: 'Attending Seminarian orientation at Andrews Theological Seminary.',
    status: 'PENDING',
    createdAt: '2026-08-05T14:20:00Z'
  }
];

export const initialMessages: Message[] = [
  {
    id: 'msg-1',
    stayRequestId: 'req-101',
    senderId: 'user-guest-1',
    senderName: 'David Miller',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    receiverId: 'user-host-1',
    content: 'Greetings Elder Vance! We are excited to visit Loma Linda. Our flight lands Friday at 2:30 PM. Can we bring anything for Sabbath potluck?',
    timestamp: '2026-08-02T11:00:00Z',
    isRead: true
  },
  {
    id: 'msg-2',
    stayRequestId: 'req-101',
    senderId: 'user-host-1',
    senderName: 'Elder Marcus Vance',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    receiverId: 'user-guest-1',
    content: 'Happy Sabbath in advance David! No need to bring anything; Ellen is preparing a warm plant-based loaf and fresh fruit salad. Safe travels!',
    timestamp: '2026-08-02T11:45:00Z',
    isRead: true,
    templateType: 'SABBATH_INVITE'
  }
];

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    listingId: 'list-1',
    stayRequestId: 'req-prev-1',
    reviewerId: 'user-rev-1',
    reviewerName: 'Pr. Benjamin Taylor',
    reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    reviewerChurch: 'Atlanta Berean SDA Church',
    rating: 5,
    cleanlinessRating: 5,
    fellowshipRating: 5,
    sabbathFriendlinessRating: 5,
    comment: 'An absolute blessing! Elder Vance and Sister Ellen treated us like family. The accommodations were spotless, peaceful, and the Sabbath atmosphere was truly refreshing.',
    createdAt: '2026-07-20'
  }
];

export const initialVerificationRequests: VerificationRequest[] = [
  {
    id: 'vreq-1',
    userId: 'user-guest-1',
    userName: 'David & Sarah Miller',
    userEmail: 'david.miller@adventistmail.org',
    userPhone: '+1 (269) 555-0192',
    churchName: 'Pioneer Memorial Church',
    conference: 'Michigan Conference',
    pastorName: 'Pr. Dwight Nelson',
    pastorEmail: 'pastor.nelson@andrews.edu',
    pastorPhone: '+1 (269) 471-3133',
    status: 'VERIFIED',
    documentType: 'PASTOR_LETTER',
    submittedAt: '2026-07-10T09:00:00Z',
    reviewedBy: 'Sister Rachel Santos',
    notes: 'Verified against Michigan Conference official pastoral directory.'
  },
  {
    id: 'vreq-2',
    userId: 'user-new-2',
    userName: 'Hannah & Caleb Schmidt',
    userEmail: 'hannah.schmidt@gmail.com',
    userPhone: '+1 (616) 555-0144',
    churchName: 'Grand Rapids SDA Church',
    conference: 'Michigan Conference',
    pastorName: 'Pr. Mark Howard',
    pastorEmail: 'pastor.howard@michigan.org',
    pastorPhone: '+1 (616) 555-0199',
    status: 'PENDING',
    documentType: 'MEMBERSHIP_LETTER',
    submittedAt: '2026-08-06T15:30:00Z'
  }
];

export const initialFamilyProfiles: FamilyProfile[] = [
  {
    id: 'family-mwemba',
    familyName: 'The Mwemba Family',
    country: 'Tanzania',
    city: 'Arusha',
    localChurch: 'Arusha Central SDA Church',
    conference: 'Northern Tanzania Union Conference',
    parentsNames: 'Baraka & Neema Mwemba',
    childrenAges: ['8 yrs', '12 yrs', '15 yrs'],
    adultCount: 2,
    childrenCount: 3,
    languages: ['Swahili', 'English'],
    interests: ['ADRA Community Outreach', 'Safari Nature Walks', 'Youth Choir', 'Organic Tropical Gardening'],
    culturalBackground: 'Authentic East African Adventist culture. Our home is filled with choral harmony, warm East African hospitality, fresh tropical Sabbath lunches, and vibrant church fellowship in Arusha near Mt. Meru.',
    familyStory: 'Baraka works in community health education and Neema teaches at our local Adventist school. We have raised our three children in the Pathfinder club. We love opening our home to Adventist families worldwide to share East African culture, learn about global church heritages, and build lifelong Christian relationships.',
    hostingPreferences: 'We offer a dedicated guest family suite with private bath, garden patio, and daily plant-based Tanzanian meals (matoke, beans, fresh fruits).',
    sabbathTraditions: 'Friday sunset vespers with Swahili acoustic songs, Sabbath morning divine service at Arusha Central, and afternoon nature walks or visiting local orphanages.',
    availableMonths: ['June', 'July', 'August', 'December'],
    preferredDurations: '1 to 2 Weeks',
    verificationTier: 'CONFERENCE_VERIFIED',
    familyPhotos: [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506869640319-fe1a24c46dd4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
    ],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    lookingForExchangeRegions: ['Europe (Germany/UK)', 'North America (USA/Canada)', 'Australia'],
    rating: 5.0,
    reviewCount: 4
  },
  {
    id: 'family-muller',
    familyName: 'The Müller Family',
    country: 'Germany',
    city: 'Berlin',
    localChurch: 'Berlin-Spandau Seventh-day Adventist Church',
    conference: 'Hanseatic Conference (Inter-European Division)',
    parentsNames: 'Lukas & Sophia Müller',
    childrenAges: ['9 yrs', '13 yrs'],
    adultCount: 2,
    childrenCount: 2,
    languages: ['German', 'English', 'French'],
    interests: ['European History', 'Pathfinders', 'Organic Sourdough Baking', 'Classical Violin & Flute'],
    culturalBackground: 'European Christian family heritage centered around nature, classical music, and rich Adventist Reformation history.',
    familyStory: 'Lukas is an architect and Sophia is a music instructor. Our family loves historical walks in Berlin, participating in Pathfinder campouts, and cooking hearty European vegetarian dishes. We are deeply eager for our children to experience African and South American Adventist cultures.',
    hostingPreferences: 'Guest apartment floor with private kitchen, balcony overlooking Berlin park, and family dinner exchanges.',
    sabbathTraditions: 'Candlelight vespers on Friday evening with flute and violin duets, Sabbath morning worship in Spandau, and Sabbath afternoon walks through Havelland nature reserves.',
    availableMonths: ['July', 'August', 'October'],
    preferredDurations: '10 to 14 Days',
    verificationTier: 'ADMIN_VERIFIED',
    familyPhotos: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506869640319-fe1a24c46dd4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
    ],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    lookingForExchangeRegions: ['East Africa (Tanzania/Kenya)', 'South America (Brazil)', 'Asia-Pacific'],
    rating: 4.9,
    reviewCount: 3
  },
  {
    id: 'family-vance',
    familyName: 'The Vance Family',
    country: 'United States',
    city: 'Loma Linda, CA',
    localChurch: 'Loma Linda University Church',
    conference: 'Southeastern California Conference',
    parentsNames: 'Marcus & Ellen Vance',
    childrenAges: ['19 yrs (University)', '22 yrs (Medical Student)'],
    adultCount: 2,
    childrenCount: 2,
    languages: ['English', 'Spanish'],
    interests: ['Adventist Health Heritage', 'Loma Linda Blue Zone Cooking', 'University Campus Tours', 'Pacific Coast Nature Trips'],
    culturalBackground: 'Loma Linda Blue Zone health principles, deep roots in Adventist medical mission history, and active community hospitality.',
    familyStory: 'Marcus worked in Adventist hospital administration and Ellen leads health ministry workshops. We love hosting global Adventist families visiting Southern California and giving them an insider tour of Loma Linda University, Ellen White historical sites, and nearby Pacific beaches.',
    hostingPreferences: 'Spacious guest wing with private bathroom, garden patio, and daily plant-based meals.',
    sabbathTraditions: 'Friday sunset vespers fellowship dinner, Sabbath divine service at LLUC, and afternoon nature walks in Redlands hills.',
    availableMonths: ['January', 'June', 'July', 'August', 'November'],
    preferredDurations: '1 Week',
    verificationTier: 'CONFERENCE_VERIFIED',
    familyPhotos: [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506869640319-fe1a24c46dd4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80'
    ],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    lookingForExchangeRegions: ['Europe', 'East Africa', 'South America', 'Central America'],
    rating: 5.0,
    reviewCount: 6
  },
  {
    id: 'family-okafor',
    familyName: 'The Okafor Family',
    country: 'Kenya',
    city: 'Nairobi',
    localChurch: 'Newlife Seventh-day Adventist Church',
    conference: 'East Kenya Union Conference',
    parentsNames: 'Joseph & Mary Okafor',
    childrenAges: ['7 yrs', '10 yrs', '14 yrs'],
    adultCount: 2,
    childrenCount: 3,
    languages: ['English', 'Swahili'],
    interests: ['Children Ministry', 'Health Evangelism', 'Gospel Music Ministry', 'Wildlife Conservation'],
    culturalBackground: 'Joyful Kenyan Adventist family culture centered on church choir, vibrant Sabbath fellowship, and community service.',
    familyStory: 'Joseph works in IT for Adventist World Radio and Mary leads children Sabbath School. We love connecting with families from other continents so our children learn global perspectives of our blessed hope.',
    hostingPreferences: 'Comfortable family home guest room in quiet Nairobi neighborhood near Newlife SDA Church.',
    sabbathTraditions: 'Friday evening family prayer and song circle, Sabbath worship at Newlife SDA, and afternoon potluck with church youth.',
    availableMonths: ['April', 'August', 'December'],
    preferredDurations: '1 to 2 Weeks',
    verificationTier: 'ADMIN_VERIFIED',
    familyPhotos: [
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506869640319-fe1a24c46dd4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
    ],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    lookingForExchangeRegions: ['North America', 'Europe', 'Asia'],
    rating: 4.8,
    reviewCount: 2
  },
  ...additionalFamilyProfiles
];

export const initialFamilyExchangeRequests: FamilyExchangeRequest[] = [
  {
    id: 'exreq-1',
    requesterFamilyId: 'family-muller',
    requesterFamilyName: 'The Müller Family',
    requesterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    requesterCountry: 'Germany',
    requesterChurch: 'Berlin-Spandau SDA Church',
    targetFamilyId: 'family-mwemba',
    targetFamilyName: 'The Mwemba Family',
    targetAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    targetCountry: 'Tanzania',
    targetChurch: 'Arusha Central SDA Church',
    exchangeType: 'CULTURAL_EXCHANGE',
    proposedMonth: 'August 2026',
    preferredDuration: '10 Days',
    introNote: 'Dear Mwemba Family! Greetings in Jesus. Our family in Berlin is deeply interested in experiencing East African Adventist culture, worshipping together in Arusha, and introducing our children to African Christian hospitality. We would also be honored to host your family in Berlin in July 2027.',
    status: 'APPROVED',
    createdAt: '2026-08-01T10:00:00Z'
  }
];


export const initialFamilyExchangeReviews: FamilyExchangeReview[] = [
  {
    id: 'exrev-1',
    exchangeId: 'exreq-prev-1',
    reviewerFamilyId: 'family-vance',
    reviewerFamilyName: 'The Vance Family',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    reviewerCountry: 'United States',
    targetFamilyId: 'family-mwemba',
    hospitalityRating: 5,
    communicationRating: 5,
    familyFriendlinessRating: 5,
    sabbathExperienceRating: 5,
    culturalExperienceRating: 5,
    comment: 'An unforgettable spiritual and cultural experience! The Mwemba family welcomed us with open arms, introduced us to Arusha Central church choir, and shared wholesome Tanzanian meals. Lifelong Christian bonds were formed!',
    createdAt: '2026-07-15'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    actorId: 'user-admin-1',
    actorName: 'Sister Rachel Santos',
    actorRole: 'ADMIN',
    action: 'MEMBER_VERIFIED',
    details: 'Approved Member Verification for David & Sarah Miller (Ref: #vreq-1)',
    timestamp: '2026-08-06T18:22:00Z',
    ipAddress: '192.168.1.45'
  },
  {
    id: 'log-2',
    actorId: 'user-host-1',
    actorName: 'Elder Marcus Vance',
    actorRole: 'HOST',
    action: 'STAY_APPROVED',
    details: 'Approved stay request #req-101 for David & Sarah Miller',
    timestamp: '2026-08-01T11:00:00Z',
    ipAddress: '172.16.0.12'
  }
];

export const initialMemberships: import('../types').UserMembership[] = [
  {
    id: 'mem-1',
    userId: 'user-guest-1',
    userName: 'David & Sarah Miller',
    householdName: 'The Miller Family',
    coveredMembers: ['David Miller', 'Sarah Miller', 'Ethan Miller'],
    plan: 'GLOBAL_FAMILY',
    price: 79,
    currency: 'USD',
    startDate: '2026-01-15T00:00:00.000Z',
    expirationDate: '2027-01-15T00:00:00.000Z',
    paymentReference: 'STRIPE_TX_9831001',
    paymentProvider: 'stripe',
    status: 'ACTIVE',
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'mem-2',
    userId: 'user-guest-explorer',
    userName: 'Jonathan Vance',
    householdName: 'Jonathan Vance Household',
    coveredMembers: ['Jonathan Vance'],
    plan: 'FREE',
    price: 0,
    currency: 'USD',
    startDate: '2026-05-10T00:00:00.000Z',
    expirationDate: '2027-05-10T00:00:00.000Z',
    paymentReference: 'FREE_REG_1029',
    paymentProvider: 'free',
    status: 'FREE',
    createdAt: '2026-05-10T00:00:00.000Z',
    updatedAt: '2026-05-10T00:00:00.000Z'
  },
  {
    id: 'mem-3',
    userId: 'user-host-1',
    userName: 'Elder Marcus & Ellen Vance',
    householdName: 'The Vance Family',
    coveredMembers: ['Marcus Vance', 'Ellen Vance'],
    plan: 'SABBATH_MEMBER',
    price: 39,
    currency: 'USD',
    startDate: '2025-08-20T00:00:00.000Z',
    expirationDate: '2026-08-20T00:00:00.000Z',
    paymentReference: 'PAYPAL_ORDER_8829',
    paymentProvider: 'paypal',
    status: 'ACTIVE',
    createdAt: '2025-08-20T00:00:00.000Z',
    updatedAt: '2025-08-20T00:00:00.000Z'
  }
];

export const initialTransactions: import('../types').PaymentTransaction[] = [
  {
    id: 'tx-1',
    userId: 'user-guest-1',
    userName: 'David & Sarah Miller',
    householdName: 'The Miller Family',
    plan: 'GLOBAL_FAMILY',
    amount: 79,
    currency: 'USD',
    provider: 'stripe',
    status: 'COMPLETED',
    paymentReference: 'STRIPE_TX_9831001',
    transactionDate: '2026-01-15T10:30:00.000Z',
    receiptNumber: 'REC-STRIPE-40192',
    description: 'Annual Membership: GLOBAL FAMILY ($79/yr)'
  },
  {
    id: 'tx-2',
    userId: 'user-host-1',
    userName: 'Elder Marcus & Ellen Vance',
    householdName: 'The Vance Family',
    plan: 'SABBATH_MEMBER',
    amount: 39,
    currency: 'USD',
    provider: 'paypal',
    status: 'COMPLETED',
    paymentReference: 'PAYPAL_ORDER_8829',
    transactionDate: '2025-08-20T14:15:00.000Z',
    receiptNumber: 'REC-PP-30198',
    description: 'Annual Membership: SABBATH MEMBER ($39/yr)'
  },
  {
    id: 'tx-3',
    userId: 'user-host-2',
    userName: 'Dr. Samuel & Elena Mwemba',
    householdName: 'The Mwemba Household',
    plan: 'FAMILY_EXCHANGE',
    amount: 59,
    currency: 'USD',
    provider: 'pesapal',
    status: 'COMPLETED',
    paymentReference: 'PESAPAL_MERCHANT_7712',
    transactionDate: '2026-03-01T09:00:00.000Z',
    receiptNumber: 'REC-PESA-8821',
    description: 'Annual Membership: FAMILY EXCHANGE ($59/yr)'
  }
];

export const initialStayCategories: import('../types').StayCategory[] = [
  { id: 'cat-city', name: 'City', icon: 'Building2', description: 'Urban host homes close to city SDA churches and transport', enabled: true, order: 1 },
  { id: 'cat-village', name: 'Village', icon: 'Home', description: 'Charming village and small-town SDA community homestays', enabled: true, order: 2 },
  { id: 'cat-beach', name: 'Beach', icon: 'Waves', description: 'Coastal homes near scenic beaches and ocean breezes', enabled: true, order: 3 },
  { id: 'cat-mountain', name: 'Mountain', icon: 'Mountain', description: 'Peaceful mountain retreats ideal for Sabbath reflection', enabled: true, order: 4 },
  { id: 'cat-farm', name: 'Farm', icon: 'Tractor', description: 'Organic farm stays with fresh country air and gardens', enabled: true, order: 5 },
  { id: 'cat-nature', name: 'Nature', icon: 'Trees', description: 'Surrounded by nature, hiking trails, and Sabbath beauty', enabled: true, order: 6 },
  { id: 'cat-family', name: 'Family', icon: 'Users', description: 'Warm family environment with kids, games, and fellowship', enabled: true, order: 7 },
  { id: 'cat-quiet', name: 'Quiet', icon: 'VolumeX', description: 'Quiet, restful atmosphere perfect for rest and study', enabled: true, order: 8 },
  { id: 'cat-culture', name: 'Culture', icon: 'Globe2', description: 'Rich Adventist cultural exchange and international heritage', enabled: true, order: 9 },
  { id: 'cat-modern', name: 'Modern', icon: 'Sparkles', description: 'Modern amenities with fast Wi-Fi and comfortable guest spaces', enabled: true, order: 10 },
];



